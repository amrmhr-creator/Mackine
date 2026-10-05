import Link from "next/link";
import CategoryIcon from "@/components/CategoryIcon";
import DeleteButton from "@/components/admin/DeleteButton";
import { requireAdmin } from "@/lib/admin-auth";
import { categoriesStore } from "@/lib/catalog-data";
import { categoryHref } from "@/lib/categories";
import { moveCategoryAction, toggleCategoryAction } from "../../actions";

export const metadata = { title: "الأقسام" };

export default async function Page({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  await requireAdmin();
  const [{ saved, deleted }, categories] = await Promise.all([searchParams, categoriesStore.read()]);

  return (
    <>
      <div className="admin-title">
        <h1>الأقسام</h1>
        <Link className="btn btn-red btn-sm" href="/admin/categories/new">
          + قسم جديد
        </Link>
      </div>
      {saved && (
        <p className="admin-saved">
          ✓ القسم اتحفظ. <Link href={`/products/${saved}`} target="_blank">شوفه على الموقع ↗</Link>
        </p>
      )}
      {deleted && <p className="admin-saved">✓ القسم راح سلة المهملات.</p>}
      <p className="muted">الترتيب هنا هو ترتيب الأقسام على الموقع. المخفي مش بيظهر للزوار، بس تقدر تعاينه.</p>

      <table className="admin-table">
        <tbody>
          {categories.map((c, i) => (
            <tr key={c.slug} className={c.visible ? "" : "is-hidden"}>
              <td className="icon-cell">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image.replace(/\.webp$/, "-sm.webp")} alt="" />
                ) : (
                  <CategoryIcon name={c.icon} size={32} />
                )}
              </td>
              <td>
                <strong>{c.name}</strong>
                {!c.visible && <span className="tag">مخفي</span>}
                <div className="muted small ltr">{categoryHref(c)}</div>
              </td>
              <td className="admin-row-actions">
                <Link className="btn btn-sm btn-red" href={`/admin/categories/${c.slug}`}>
                  عدّل
                </Link>
                <Link className="btn btn-sm btn-outline" href={`/admin/preview/category/${c.slug}`} target="_blank">
                  عاين
                </Link>
                <form action={toggleCategoryAction}>
                  <input type="hidden" name="slug" value={c.slug} />
                  <input type="hidden" name="show" value={c.visible ? "0" : "1"} />
                  <button className="btn btn-sm btn-outline" type="submit">
                    {c.visible ? "اخفيه" : "اظهره"}
                  </button>
                </form>
                <form action={moveCategoryAction}>
                  <input type="hidden" name="slug" value={c.slug} />
                  <button className="btn btn-sm btn-outline" name="dir" value="up" disabled={i === 0} aria-label="طلّعه">
                    ↑
                  </button>
                  <button
                    className="btn btn-sm btn-outline"
                    name="dir"
                    value="down"
                    disabled={i === categories.length - 1}
                    aria-label="نزّله"
                  >
                    ↓
                  </button>
                </form>
                <DeleteButton kind="category" itemKey={c.slug} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
