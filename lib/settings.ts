import "server-only";
import { jsonStore } from "./json-file";
import { SITE } from "./site";

// Site settings edited from /admin/settings: contact details, company details, social links,
// and the main texts of the home and about pages. Saved as settings.json in the data folder.
// An empty field means "use the default" (fallback). A fallback of "" = hidden while empty.

type Field = {
  key: string;
  label: string;
  fallback: string;
  multiline?: boolean;
  ltr?: boolean;
  hint?: string;
};

export type FieldGroup = { title: string; note?: string; fields: Field[] };

const pair = (prefix: string, n: number, title: string, text: string): Field[] => [
  { key: `${prefix}${n}.title`, label: `${n}. العنوان`, fallback: title },
  { key: `${prefix}${n}.text`, label: `${n}. الكلام`, fallback: text, multiline: true },
];

export const SETTINGS_GROUPS: FieldGroup[] = [
  {
    title: "التواصل",
    note: "أي خانة فاضية مش بتظهر على الموقع. لو رقم الواتساب فاضي، زراير الواتساب بتستخبى.",
    fields: [
      { key: "contact.whatsapp", label: "رقم الواتساب", fallback: "+20 106 565 9767", ltr: true, hint: "زي 01001234567، أو برقم الدولة زي +966…" },
      { key: "contact.phone", label: "رقم التليفون (لو غير الواتساب)", fallback: "", ltr: true },
      { key: "contact.email", label: "الإيميل اللي بيظهر على الموقع", fallback: "", ltr: true },
      { key: "contact.hours", label: "مواعيد العمل", fallback: "من السبت للخميس، من 9 الصبح لـ 5 العصر" },
      { key: "contact.address", label: "العنوان", fallback: "" },
      { key: "contact.mapUrl", label: "لينك المكان على خرائط جوجل", fallback: "", ltr: true },
      { key: "contact.tagline", label: "جملة تعريف الشركة (في آخر الصفحة، ولجوجل)", fallback: SITE.tagline, multiline: true },
    ],
  },
  {
    title: "بيانات الشركة",
    note: "أي خانة فاضية مش بتظهر على الموقع.",
    fields: [
      { key: "business.legalName", label: "الاسم الرسمي زي ما هو متسجّل", fallback: "" },
      { key: "business.commercialRegister", label: "رقم السجل التجاري", fallback: "", ltr: true },
      { key: "business.taxId", label: "رقم البطاقة الضريبية", fallback: "", ltr: true },
    ],
  },
  {
    title: "السوشيال ميديا",
    note: "حط اللينك كامل (بيبدأ بـ https://). الفاضي مش بيظهر.",
    fields: [
      { key: "social.facebook", label: "فيسبوك", fallback: "", ltr: true },
      { key: "social.linkedin", label: "لينكد إن", fallback: "", ltr: true },
      { key: "social.instagram", label: "إنستجرام", fallback: "", ltr: true },
      { key: "social.youtube", label: "يوتيوب", fallback: "", ltr: true },
    ],
  },
  {
    title: "الصفحة الرئيسية",
    fields: [
      { key: "home.heroTitle", label: "العنوان الكبير", fallback: "قطعة الغيار اللي مصنعك محتاجها، بالكمية اللي تحتاجها." },
      {
        key: "home.heroLead",
        label: "الجملة اللي تحته",
        multiline: true,
        fallback:
          "بدل ما فريق الصيانة يلف على التجار، ابعتلنا رقم القطعة أو صورتها، واحنا ندوّر ونجهزلك عرض سعر ونورّد لحد باب المصنع.",
      },
      ...pair("home.step", 1, "ابعت طلبك", "رقم القطعة، أو صورتها، أو المقاس، والكمية اللي محتاجها. من الفورم أو على الواتساب."),
      ...pair("home.step", 2, "استلم عرض السعر", "بنراجع الطلب ونرجعلك بعرض سعر مكتوب وميعاد توريد محدد."),
      ...pair("home.step", 3, "نورّدلك", "بعد الموافقة بنجهز الكمية ونوصّلها لحد المصنع أو المخزن."),
      ...pair("home.why", 1, "طلب واحد بدل عشر مكالمات", "قايمة القطع كلها مع جهة واحدة، بدل ما تقسمها على أكتر من تاجر."),
      ...pair("home.why", 2, "أي كمية", "من قطعة واحدة لماكينة واقفة، لحد توريدات الصيانة الدورية للمصنع كله."),
      ...pair("home.why", 3, "الماركة المطلوبة أو بديل مكافئ", "بنوفرلك الماركة اللي محتاجها، ولو مش متاحة بنقترح بديل بنفس المواصفات وبنقولك الفرق."),
      ...pair("home.why", 4, "عرض مكتوب وفاتورة رسمية", "سعر واضح وميعاد توريد ملتزمين بيه، من غير مفاجآت."),
      {
        key: "home.sectors",
        label: "القطاعات اللي بتخدموها",
        hint: "كل قطاع في سطر لوحده.",
        multiline: true,
        fallback: "مصانع الأغذية\nالأسمنت ومواد البناء\nالنسيج\nالبلاستيك والتغليف\nالبترول والغاز\nورش الصيانة",
      },
    ],
  },
  {
    title: "مين احنا",
    fields: [
      {
        key: "about.lead",
        label: "الجملة اللي تحت العنوان",
        multiline: true,
        fallback: "ماكين وسيط توريد لقطع الغيار الصناعية: بنوصّل المصانع والورش بالقطعة اللي محتاجاها، بالكمية والميعاد المناسبين.",
      },
      {
        key: "about.story",
        label: "حكايتنا",
        hint: "سيب سطر فاضي بين كل فقرة والتانية.",
        multiline: true,
        fallback:
          "في أي مصنع، ماكينة واقفة معناها خسارة كل ساعة. وأغلب الوقت المشكلة مش في القطعة نفسها، المشكلة في التدوير عليها: مين عنده؟ بكام؟ وهيوصل إمتى؟\n\nعشان كده بدأنا ماكين. بنستلم طلب المصنع، رقم قطعة أو صورة أو قايمة كاملة، وبنشتغل على توفيره من الموردين والوكلاء اللي بنتعامل معاهم، وبنرجع بعرض سعر واحد واضح، ونوصّل لحد الباب.",
      },
    ],
  },
];

const FIELDS = new Map(SETTINGS_GROUPS.flatMap((g) => g.fields).map((f) => [f.key, f]));

const store = jsonStore<Record<string, string>>("settings.json", () => ({}));

/** What's saved: only the fields the owner filled in. */
export async function savedSettings(): Promise<Record<string, string>> {
  const data = await store.read();
  return typeof data === "object" && data ? data : {};
}

/** "01001234567" → "201001234567"; "+966 50…" → "96650…". Digits only, with the country code. */
export function internationalNumber(input: string) {
  const digits = input.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/\D/g, "");
  if (/^01\d{9}$/.test(digits)) return `2${digits}`; // Egyptian mobile without the country code
  if (digits.startsWith("00")) return digits.slice(2);
  return digits;
}

export type SiteSettings = Awaited<ReturnType<typeof getSettings>>;

const lines = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

/** Settings for the site pages: saved values, or the defaults for empty ones. */
export async function getSettings() {
  const saved = await savedSettings();
  const get = (key: string) => (saved[key]?.trim() ? saved[key].trim() : (FIELDS.get(key)?.fallback ?? ""));
  const pairs = (prefix: string, count: number) =>
    Array.from({ length: count }, (_, i) => ({ title: get(`${prefix}${i + 1}.title`), text: get(`${prefix}${i + 1}.text`) }));
  const whatsappDisplay = get("contact.whatsapp");

  return {
    get,
    /** International digits, or "" when no number is set (WhatsApp buttons are hidden then). */
    whatsappNumber: internationalNumber(whatsappDisplay),
    whatsappDisplay,
    phone: get("contact.phone"),
    email: get("contact.email"),
    hours: get("contact.hours"),
    address: get("contact.address"),
    mapUrl: get("contact.mapUrl"),
    tagline: get("contact.tagline"),
    business: {
      legalName: get("business.legalName"),
      commercialRegister: get("business.commercialRegister"),
      taxId: get("business.taxId"),
    },
    social: [
      { label: "فيسبوك", href: get("social.facebook") },
      { label: "لينكد إن", href: get("social.linkedin") },
      { label: "إنستجرام", href: get("social.instagram") },
      { label: "يوتيوب", href: get("social.youtube") },
    ].filter((s) => s.href),
    heroTitle: get("home.heroTitle"),
    heroLead: get("home.heroLead"),
    homeSteps: pairs("home.step", 3),
    homeWhy: pairs("home.why", 4),
    sectors: lines(get("home.sectors")),
    aboutLead: get("about.lead"),
    aboutStory: get("about.story")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
  };
}

export class SettingsError extends Error {}

/** Checks and saves the settings form. Throws SettingsError with the message to show. */
export async function saveSettings(input: Record<string, string>) {
  const out: Record<string, string> = {};
  for (const [key, field] of FIELDS) {
    const value = (input[key] ?? "").trim().slice(0, field.multiline ? 3000 : 300);
    if (value) out[key] = value;
  }

  const wa = out["contact.whatsapp"];
  if (wa && !/^\d{10,15}$/.test(internationalNumber(wa))) throw new SettingsError("رقم الواتساب مش مظبوط.");
  const email = out["contact.email"];
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new SettingsError("الإيميل مش مظبوط.");
  for (const key of ["contact.mapUrl", "social.facebook", "social.linkedin", "social.instagram", "social.youtube"]) {
    if (out[key] && !/^https:\/\/[^\s"<>]+$/.test(out[key])) {
      throw new SettingsError(`لينك ${FIELDS.get(key)!.label} لازم يبدأ بـ https://`);
    }
  }

  await store.write(out);
}
