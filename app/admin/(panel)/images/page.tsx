import DeleteButton from "@/components/admin/DeleteButton";
import { requireAdmin } from "@/lib/admin-auth";
import { canResize, listImages, smallUrl } from "@/lib/uploads";
import { saveImageAltAction } from "../../actions";
import ImageUploader from "./ImageUploader";

export const metadata = { title: "الصور" };

export default async function Page({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  await requireAdmin();
  const [{ deleted }, images, resizeOk] = await Promise.all([searchParams, listImages(), canResize()]);

  return (
    <>
      <div className="admin-title">
        <h1>الصور</h1>
      </div>
      {!resizeOk && <p className="notice">ضغط الصور مش شغال على السيرفر ده، فرفع الصور واقف. ابعت الرسالة دي للمبرمج.</p>}
      {deleted && <p className="admin-saved">✓ الصورة راحت سلة المهملات.</p>}

      <div className="admin-images-top">
        <ImageUploader />
        <div className="card">
          <h3>إزاي تستخدم الصور</h3>
          <ol>
            <li>ارفع الصور من هنا (صور المنتجات، ولوجوهات الماركات).</li>
            <li>
              اختار صورة كل قسم من صفحة <a href="/admin/categories">الأقسام</a>، ولوجو كل ماركة من صفحة{" "}
              <a href="/admin/brands">الماركات</a>.
            </li>
          </ol>
          <p className="muted small">القسم اللي من غير صورة بيظهر بأيقونته، والماركة اللي من غير لوجو بيظهر اسمها مكتوب.</p>
        </div>
      </div>

      {images.length === 0 ? (
        <p className="muted">لسه مفيش صور مرفوعة.</p>
      ) : (
        <>
          <h2>كل الصور</h2>
          <div className="admin-image-list">
            {images.map((i) => (
              <div key={i.name} className="card admin-image-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={smallUrl(i.name)} alt={i.alt} loading="lazy" />
                <form action={saveImageAltAction}>
                  <input type="hidden" name="name" value={i.name} />
                  <label>
                    الوصف
                    <input name="alt" defaultValue={i.alt} maxLength={150} />
                  </label>
                  <button className="btn btn-outline btn-sm" type="submit">
                    احفظ الوصف
                  </button>
                </form>
                <DeleteButton kind="image" itemKey={i.name} label="امسح الصورة" />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
