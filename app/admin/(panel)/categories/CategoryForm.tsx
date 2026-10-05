"use client";

import Link from "next/link";
import { useActionState } from "react";
import ImagePicker, { type PickerImage } from "@/components/admin/ImagePicker";
import PairsEditor from "@/components/admin/PairsEditor";
import { ICONS, ICON_LABELS, type Category } from "@/lib/categories";
import { saveCategoryAction, type FormState } from "../../actions";

/** Add or edit a category. On an error the typed values come back so nothing is lost. */
export default function CategoryForm({ category, images }: { category?: Category; images: PickerImage[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCategoryAction, {
    error: "",
    saved: false,
    values: {},
    attempt: 0,
  });
  const v = (key: string, fallback = "") => state.values[key] ?? fallback;
  const c = category;
  // A new attempt re-mounts the fields with what was sent, so an error doesn't wipe the form.
  const k = state.attempt;

  return (
    <form action={action} className="admin-form wide" key={k}>
      {c && <input type="hidden" name="slug" value={c.slug} />}
      <label>
        اسم القسم
        <input name="name" required maxLength={80} defaultValue={v("name", c?.name)} />
      </label>
      {!c && (
        <label>
          لينك القسم بالإنجليزي <small>(اختياري، زي gearboxes. لو سبته فاضي بيتعمل لوحده، ومش بيتغيّر بعد الحفظ)</small>
          <input name="wantedSlug" maxLength={60} dir="ltr" defaultValue={v("wantedSlug")} />
        </label>
      )}
      <label>
        الأيقونة <small>(بتظهر لو مفيش صورة)</small>
        <select name="icon" defaultValue={v("icon", c?.icon ?? "wrench")}>
          {ICONS.map((icon) => (
            <option key={icon} value={icon}>
              {ICON_LABELS[icon]}
            </option>
          ))}
        </select>
      </label>
      <label>
        سطر قصير <small>(بيظهر في كارت القسم)</small>
        <input name="short" required maxLength={200} defaultValue={v("short", c?.short)} />
      </label>
      <label>
        الإجابة باختصار <small>(أول فقرة في صفحة القسم: القسم فيه إيه، وتبعتلنا إيه عشان تطلب. دي اللي جوجل والذكاء الاصطناعي بياخدوها)</small>
        <textarea name="answer" required maxLength={1500} rows={5} defaultValue={v("answer", c?.answer)} />
      </label>

      <fieldset>
        <legend>الأنواع اللي بتوردوها</legend>
        <PairsEditor
          titleName="typeName"
          textName="typeText"
          titleLabel="اسم النوع"
          textLabel="شرح قصير"
          addLabel="+ نوع تاني"
          initial={state.values.typesJson ? JSON.parse(state.values.typesJson) : (c?.types ?? []).map((t) => ({ title: t.name, text: t.text }))}
        />
      </fieldset>

      <label>
        أمثلة لأرقام القطع <small>(كل رقم في سطر)</small>
        <textarea name="codes" rows={5} dir="ltr" defaultValue={v("codes", c?.codes.join("\n"))} />
      </label>

      <fieldset>
        <legend>أسئلة عن القسم</legend>
        <PairsEditor
          titleName="faqQ"
          textName="faqA"
          titleLabel="السؤال"
          textLabel="الإجابة"
          addLabel="+ سؤال تاني"
          initial={state.values.faqJson ? JSON.parse(state.values.faqJson) : (c?.faq ?? []).map((q) => ({ title: q.q, text: q.a }))}
        />
      </fieldset>

      <fieldset>
        <legend>صورة القسم (اختياري)</legend>
        <ImagePicker name="image" images={images} initial={v("image", c?.image ?? "")} />
      </fieldset>

      <details className="seo-fields">
        <summary>جوجل والمشاركة (اختياري)</summary>
        <p className="muted small">لو سبتهم فاضيين، العنوان والوصف بيتعملوا لوحدهم من اسم القسم والإجابة باختصار.</p>
        <label>
          العنوان في جوجل <small>(لحد 60 حرف)</small>
          <input name="seoTitle" maxLength={70} defaultValue={v("seoTitle", c?.seoTitle)} />
        </label>
        <label>
          الوصف في جوجل <small>(لحد 160 حرف)</small>
          <textarea name="seoDescription" maxLength={200} rows={2} defaultValue={v("seoDescription", c?.seoDescription)} />
        </label>
      </details>

      <label className="check">
        <input type="checkbox" name="visible" defaultChecked={v("visible", c ? (c.visible ? "on" : "off") : "on") === "on"} />
        ظاهر على الموقع
      </label>

      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <div className="admin-row-actions">
        <button className="btn btn-red" type="submit" disabled={pending}>
          {pending ? "بيتحفظ..." : "احفظ القسم"}
        </button>
        <Link className="btn btn-outline" href="/admin/categories">
          رجوع
        </Link>
      </div>
    </form>
  );
}
