import DeleteButton from "@/components/admin/DeleteButton";
import ImagePicker, { type PickerImage } from "@/components/admin/ImagePicker";
import { requireAdmin } from "@/lib/admin-auth";
import type { Brand } from "@/lib/brands";
import { brandsStore, categoriesStore } from "@/lib/catalog-data";
import type { Category } from "@/lib/categories";
import { imageUrl, listImages, smallUrl } from "@/lib/uploads";
import { moveBrandAction, saveBrandAction } from "../../actions";

export const metadata = { title: "الماركات" };

function BrandForm({ brand, categories, images }: { brand?: Brand; categories: Category[]; images: PickerImage[] }) {
  return (
    <form action={saveBrandAction} className="admin-form wide">
      {brand && <input type="hidden" name="id" value={brand.id} />}
      <label>
        اسم الماركة
        <input name="name" required maxLength={60} dir="ltr" defaultValue={brand?.name} />
      </label>
      <fieldset>
        <legend>بتظهر في أنهي أقسام؟</legend>
        <div className="checks">
          {categories.map((c) => (
            <label key={c.slug} className="check">
              <input type="checkbox" name="categories" value={c.slug} defaultChecked={brand?.categories.includes(c.slug)} />
              {c.name}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>اللوجو (اختياري، من غيره بيظهر الاسم مكتوب)</legend>
        <ImagePicker name="logo" images={images} initial={brand?.logo ?? ""} />
      </fieldset>
      <label className="check">
        <input type="checkbox" name="visible" defaultChecked={brand ? brand.visible : true} />
        ظاهرة على الموقع (علّم عليها بس لو ماكين بتوردها فعلاً)
      </label>
      <button className="btn btn-red" type="submit">
        {brand ? "احفظ" : "ضيف الماركة"}
      </button>
    </form>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string; error?: string }> }) {
  await requireAdmin();
  const [{ saved, deleted, error }, brands, categories, uploaded] = await Promise.all([
    searchParams,
    brandsStore.read(),
    categoriesStore.read(),
    listImages(),
  ]);
  const images = uploaded.map((i) => ({ url: imageUrl(i.name), thumb: smallUrl(i.name), alt: i.alt }));
  const names = new Map(categories.map((c) => [c.slug, c.name]));

  return (
    <>
      <div className="admin-title">
        <h1>الماركات</h1>
      </div>
      {saved && <p className="admin-saved">✓ اتحفظت.</p>}
      {deleted && <p className="admin-saved">✓ الماركة راحت سلة المهملات.</p>}
      {error && (
        <p className="form-error" role="alert">
          {error === "name" ? "اكتب اسم الماركة." : error}
        </p>
      )}
      <p className="muted">
        الماركة بتظهر على الموقع (في الرئيسية وفي صفحات الأقسام بتاعتها) لما تكون «ظاهرة» بس. الماركات المكتوبة هنا من الأول
        هي المشهورة في السوق وكلها مخفية: اظهر اللي ماكين بتوردها فعلاً.
      </p>

      <table className="admin-table">
        <tbody>
          {brands.map((b, i) => (
            <tr key={b.id} className={b.visible ? "" : "is-hidden"}>
              <td>
                <details>
                  <summary>
                    <strong className="ltr">{b.name}</strong>
                    {b.visible ? <span className="tag tag-on">ظاهرة</span> : <span className="tag">مخفية</span>}
                    <span className="muted small"> · {b.categories.map((s) => names.get(s)).filter(Boolean).join("، ") || "من غير أقسام"}</span>
                  </summary>
                  <BrandForm brand={b} categories={categories} images={images} />
                </details>
              </td>
              <td className="admin-row-actions">
                <form action={moveBrandAction}>
                  <input type="hidden" name="id" value={b.id} />
                  <button className="btn btn-sm btn-outline" name="dir" value="up" disabled={i === 0} aria-label="طلّعها">
                    ↑
                  </button>
                  <button className="btn btn-sm btn-outline" name="dir" value="down" disabled={i === brands.length - 1} aria-label="نزّلها">
                    ↓
                  </button>
                </form>
                <DeleteButton kind="brand" itemKey={b.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>ماركة جديدة</h2>
      <BrandForm categories={categories} images={images} />
    </>
  );
}
