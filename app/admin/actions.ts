"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { RESET_LINK_MINUTES, createResetToken, passwordProblem, resetPassword, setOwnerPassword } from "@/lib/admin-accounts";
import { checkPassword, logIn, logOut, requireAdmin, startSession } from "@/lib/admin-auth";
import { runBackup } from "@/lib/backup";
import {
  CatalogError,
  deleteBrand,
  deleteCategory,
  deleteLead,
  deleteQuestion,
  moveBrand,
  moveCategory,
  moveQuestion,
  restoreBrand,
  restoreCategory,
  restoreLead,
  restoreQuestion,
  saveBrand,
  saveCategory,
  saveQuestion,
  setCategoryVisible,
  setLeadStatus,
} from "@/lib/catalog-admin";
import { ICONS, type IconName } from "@/lib/categories";
import { escapeHtml, mailConfigured, sendMail } from "@/lib/mail";
import { SettingsError, saveSettings } from "@/lib/settings";
import { SITE } from "@/lib/site";
import { purgeFromTrash, takeFromTrash, type TrashKind } from "@/lib/trash";
import { deleteImage, isImageName, nameFromUrl, restoreImage, updateAlt } from "@/lib/uploads";

const text = (f: FormData, key: string, max: number) => String(f.get(key) ?? "").trim().slice(0, max);
const lines = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
/** Only our own uploaded photos ("/uploads/<name>.webp"), else "". */
const photo = (f: FormData, key: string) => {
  const url = text(f, key, 80);
  return nameFromUrl(url) ? url : "";
};
const formValues = (formData: FormData) => Object.fromEntries([...formData.entries()].map(([k, v]) => [k, String(v)]));

/** Every page reads the panel's data, so after a change the whole site is refreshed. */
const refresh = () => revalidatePath("/", "layout");

// ---------- Login ----------

export async function loginAction(formData: FormData) {
  const error = await logIn(String(formData.get("password") ?? ""));
  redirect(error ? `/admin/login?error=${encodeURIComponent(error)}` : "/admin");
}

export async function logoutAction() {
  await logOut();
  redirect("/admin/login");
}

export type PasswordFormState = { error: string; done: boolean };

/** Changing the password from "حسابي": needs the current one. */
export async function changePasswordAction(_prev: PasswordFormState, formData: FormData): Promise<PasswordFormState> {
  await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!(await checkPassword(current))) return { error: "الباسورد الحالي غلط.", done: false };
  const problem = passwordProblem(password, String(formData.get("confirm") ?? ""));
  if (problem) return { error: problem, done: false };
  await setOwnerPassword(password);
  // The session key follows the password, so this browser needs a new session; others are logged out.
  await startSession();
  return { error: "", done: true };
}

/** "نسيت الباسورد": emails a one-time link to ADMIN_EMAIL (the owner's personal email). */
export async function requestResetAction(_prev: PasswordFormState, _formData: FormData): Promise<PasswordFormState> {
  const to = process.env.ADMIN_EMAIL?.trim();
  if (!to) return { error: "استرجاع الباسورد مش متفعّل لسه: لازم ADMIN_EMAIL يتحط في hPanel.", done: false };
  const devNoMail = process.env.NODE_ENV !== "production" && !mailConfigured();
  if (!devNoMail && !mailConfigured()) return { error: "الإيميل مش متظبط على السيرفر، فمش هنقدر نبعت اللينك.", done: false };

  const token = await createResetToken();
  if (!token) return { error: "اتبعتلك لينك من شوية. استنى 5 دقايق قبل ما تطلب واحد تاني.", done: false };
  // The live site always links to its own address, never to the Host header a request claims.
  const base = process.env.NODE_ENV === "production" ? SITE.url : `http://localhost:${process.env.PORT || 3100}`;
  const link = `${base}/admin/reset?token=${token}`;

  if (devNoMail) {
    console.log(`[admin] reset link (local test, no SMTP): ${link}`);
    return { error: "", done: true };
  }
  try {
    await sendMail({
      to,
      subject: `${SITE.nameEn}: لينك تغيير باسورد لوحة التحكم`,
      text: `حد طلب تغيير باسورد لوحة التحكم. لو ده إنت، افتح اللينك ده خلال ${RESET_LINK_MINUTES} دقيقة:\n${link}\n\nلو مش إنت، تجاهل الرسالة دي، والباسورد مش هيتغيّر.`,
      html: `<div dir="rtl" style="font-family:sans-serif"><p>حد طلب تغيير باسورد لوحة التحكم. لو ده إنت، افتح اللينك ده خلال ${RESET_LINK_MINUTES} دقيقة:</p><p><a href="${escapeHtml(link)}">غيّر الباسورد</a></p><p>لو مش إنت، تجاهل الرسالة دي، والباسورد مش هيتغيّر.</p></div>`,
    });
  } catch (err) {
    console.error(`[admin] pid ${process.pid}: reset email failed:`, err);
    return { error: "حصلت مشكلة في إرسال الإيميل. جرّب تاني بعد 5 دقايق.", done: false };
  }
  return { error: "", done: true };
}

/** The page the emailed link opens: sets the new password and logs in. */
export async function resetPasswordAction(_prev: PasswordFormState, formData: FormData): Promise<PasswordFormState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const problem = passwordProblem(password, String(formData.get("confirm") ?? ""));
  if (problem) return { error: problem, done: false };
  if (!(await resetPassword(token, password))) {
    return { error: "اللينك ده انتهى أو اتستخدم قبل كده. اطلب لينك جديد.", done: false };
  }
  await startSession();
  redirect("/admin?password=changed");
}

// ---------- Settings ----------

export type FormState = { error: string; saved: boolean; values: Record<string, string>; attempt: number };

export async function saveSettingsAction(prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const values = formValues(formData);
  try {
    await saveSettings(values);
  } catch (err) {
    if (err instanceof SettingsError) return { error: err.message, saved: false, values, attempt: prev.attempt + 1 };
    throw err;
  }
  refresh();
  return { error: "", saved: true, values, attempt: prev.attempt + 1 };
}

// ---------- Categories ----------

export async function saveCategoryAction(prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const values = formValues(formData);
  values.visible = formData.get("visible") === "on" ? "on" : "off";
  const fail = (error: string) => ({ error, saved: false, values, attempt: prev.attempt + 1 });

  const pairs = (titleKey: string, textKey: string) => {
    const titles = formData.getAll(titleKey).map((t) => String(t).trim().slice(0, 200));
    const texts = formData.getAll(textKey).map((t) => String(t).trim().slice(0, 1500));
    return titles.map((title, i) => ({ title, text: texts[i] ?? "" })).filter((p) => p.title || p.text);
  };
  const types = pairs("typeName", "typeText");
  const faq = pairs("faqQ", "faqA");
  // Typed rows come back with an error, so nothing is lost.
  values.typesJson = JSON.stringify(types);
  values.faqJson = JSON.stringify(faq);

  const name = text(formData, "name", 80);
  const short = text(formData, "short", 200);
  const answer = text(formData, "answer", 1500);
  const icon = text(formData, "icon", 20) as IconName;
  if (!name || !short || !answer) return fail("اكتب اسم القسم والسطر القصير والإجابة باختصار.");

  if (types.some((t) => !t.title || !t.text)) return fail("كل نوع محتاج اسم وشرح (أو امسح السطر الفاضي).");
  if (faq.some((q) => !q.title || !q.text)) return fail("كل سؤال محتاج إجابة (أو امسح السطر الفاضي).");

  let slug: string;
  try {
    slug = await saveCategory(
      text(formData, "slug", 80) || null,
      {
        name,
        icon: ICONS.includes(icon) ? icon : "wrench",
        short,
        answer,
        types: types.map((t) => ({ name: t.title, text: t.text })),
        codes: lines(text(formData, "codes", 2000)).slice(0, 40),
        faq: faq.map((q) => ({ q: q.title, a: q.text })),
        image: photo(formData, "image"),
        visible: values.visible === "on",
        seoTitle: text(formData, "seoTitle", 70) || undefined,
        seoDescription: text(formData, "seoDescription", 200) || undefined,
      },
      text(formData, "wantedSlug", 60),
    );
  } catch (err) {
    if (err instanceof CatalogError) return fail(err.message);
    throw err;
  }
  refresh();
  redirect(`/admin/categories?saved=${encodeURIComponent(slug)}`);
}

export async function moveCategoryAction(formData: FormData) {
  await requireAdmin();
  await moveCategory(text(formData, "slug", 80), formData.get("dir") === "up" ? -1 : 1);
  refresh();
  redirect("/admin/categories");
}

export async function toggleCategoryAction(formData: FormData) {
  await requireAdmin();
  await setCategoryVisible(text(formData, "slug", 80), formData.get("show") === "1");
  refresh();
  redirect("/admin/categories");
}

// ---------- Brands ----------

export async function saveBrandAction(formData: FormData) {
  await requireAdmin();
  const name = text(formData, "name", 60);
  if (!name) redirect("/admin/brands?error=name");
  try {
    await saveBrand(text(formData, "id", 40) || null, {
      name,
      categories: formData.getAll("categories").map(String).slice(0, 30),
      logo: photo(formData, "logo"),
      visible: formData.get("visible") === "on",
    });
  } catch (err) {
    if (err instanceof CatalogError) redirect(`/admin/brands?error=${encodeURIComponent(err.message)}`);
    throw err;
  }
  refresh();
  redirect("/admin/brands?saved=1");
}

export async function moveBrandAction(formData: FormData) {
  await requireAdmin();
  await moveBrand(text(formData, "id", 40), formData.get("dir") === "up" ? -1 : 1);
  refresh();
  redirect("/admin/brands");
}

// ---------- General questions ----------

export async function saveQuestionAction(formData: FormData) {
  await requireAdmin();
  const q = text(formData, "q", 300);
  const a = text(formData, "a", 3000);
  if (!q || !a) redirect("/admin/faq?error=1");
  await saveQuestion(text(formData, "id", 40) || null, { q, a, visible: formData.get("visible") === "on" });
  refresh();
  redirect("/admin/faq?saved=1");
}

export async function moveQuestionAction(formData: FormData) {
  await requireAdmin();
  await moveQuestion(text(formData, "id", 40), formData.get("dir") === "up" ? -1 : 1);
  refresh();
  redirect("/admin/faq");
}

// ---------- Requests ----------

export async function leadStatusAction(formData: FormData) {
  await requireAdmin();
  await setLeadStatus(text(formData, "id", 40), formData.get("status") === "done" ? "done" : "new");
  redirect(`/admin/leads${formData.get("filter") ? `?show=${encodeURIComponent(text(formData, "filter", 10))}` : ""}`);
}

// ---------- Images ----------

export async function saveImageAltAction(formData: FormData) {
  await requireAdmin();
  const name = text(formData, "name", 40);
  if (isImageName(name)) await updateAlt(name, text(formData, "alt", 150));
  refresh();
  redirect("/admin/images");
}

// ---------- Trash ----------

const BACK_TO: Record<TrashKind, string> = {
  category: "/admin/categories",
  brand: "/admin/brands",
  question: "/admin/faq",
  image: "/admin/images",
  lead: "/admin/leads",
};

/** Moves an item to the trash. The form sends its kind and key (slug, id or file name). */
export async function deleteItemAction(formData: FormData) {
  await requireAdmin();
  const kind = text(formData, "kind", 20) as TrashKind;
  const key = text(formData, "key", 120);
  if (kind === "category") await deleteCategory(key);
  else if (kind === "brand") await deleteBrand(key);
  else if (kind === "question") await deleteQuestion(key);
  else if (kind === "lead") await deleteLead(key);
  else if (kind === "image" && isImageName(key)) await deleteImage(key);
  refresh();
  redirect(`${BACK_TO[kind] ?? "/admin"}?deleted=1`);
}

export async function restoreItemAction(formData: FormData) {
  await requireAdmin();
  const entry = await takeFromTrash(text(formData, "id", 20));
  if (entry) {
    const data = entry.data as never;
    if (entry.kind === "category") await restoreCategory(data);
    else if (entry.kind === "brand") await restoreBrand(data);
    else if (entry.kind === "question") await restoreQuestion(data);
    else if (entry.kind === "lead") await restoreLead(data);
    else if (entry.kind === "image") await restoreImage(data);
  }
  refresh();
  redirect("/admin/trash?restored=1");
}

export async function purgeItemAction(formData: FormData) {
  await requireAdmin();
  await purgeFromTrash(text(formData, "id", 20));
  redirect("/admin/trash");
}

// ---------- Backups ----------

export async function backupNowAction(formData: FormData) {
  await requireAdmin();
  const result = await runBackup({ forceEmail: formData.get("email") === "1" });
  const note = result.emailed ? "emailed" : result.emailError ? `email-error:${result.emailError}` : "done";
  redirect(`/admin/backups?result=${encodeURIComponent(note)}`);
}
