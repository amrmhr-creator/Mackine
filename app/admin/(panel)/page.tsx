import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { brandsStore, categoriesStore } from "@/lib/catalog-data";
import { leadsStore } from "@/lib/leads";
import { mailConfigured } from "@/lib/mail";

export const metadata = { title: "الرئيسية" };

export default async function Page({ searchParams }: { searchParams: Promise<{ password?: string }> }) {
  await requireAdmin();
  const [{ password }, leads, categories, brands] = await Promise.all([
    searchParams,
    leadsStore.read(),
    categoriesStore.read(),
    brandsStore.read(),
  ]);
  const fresh = leads.filter((l) => l.status === "new");
  const weekAgo = Date.now() - 7 * 86_400_000;

  return (
    <>
      <div className="admin-title">
        <h1>أهلاً بيك</h1>
      </div>
      {password === "changed" && <p className="admin-saved">✓ الباسورد الجديد اتحفظ، وانت داخل بيه دلوقتي.</p>}
      {!mailConfigured() && (
        <p className="notice">
          إيميل الطلبات مش متظبط على السيرفر (SMTP)، فالطلبات بتتحفظ هنا في «الطلبات» بس ومش بتوصل على الإيميل.
        </p>
      )}
      <div className="admin-stats">
        <Link href="/admin/leads?show=new" className="card">
          <b>{fresh.length.toLocaleString("ar-EG")}</b>
          طلب جديد لسه ما اتردّش عليه
        </Link>
        <Link href="/admin/leads" className="card">
          <b>{leads.filter((l) => Date.parse(l.createdAt) > weekAgo).length.toLocaleString("ar-EG")}</b>
          طلب في آخر 7 أيام
        </Link>
        <Link href="/admin/categories" className="card">
          <b>{categories.filter((c) => c.visible).length.toLocaleString("ar-EG")}</b>
          قسم ظاهر على الموقع
        </Link>
        <Link href="/admin/brands" className="card">
          <b>{brands.filter((b) => b.visible).length.toLocaleString("ar-EG")}</b>
          ماركة ظاهرة على الموقع
        </Link>
      </div>
      <h2>تعمل إيه من هنا؟</h2>
      <ul className="admin-links">
        <li>
          <Link href="/admin/leads">الطلبات</Link>: كل طلبات عروض الأسعار اللي وصلت من الموقع، وتنزيلها Excel.
        </li>
        <li>
          <Link href="/admin/categories">الأقسام</Link>: تعديل أو إضافة أو إخفاء أقسام المنتجات وكلامها وصورها.
        </li>
        <li>
          <Link href="/admin/brands">الماركات</Link>: الماركات اللي بتوردوها، وتظهر على الموقع لما تعلّم «ظاهرة».
        </li>
        <li>
          <Link href="/admin/settings">الإعدادات</Link>: الواتساب والإيميل والعنوان ونصوص الصفحة الرئيسية و«مين احنا».
        </li>
        <li>
          <Link href="/admin/guide">الدليل</Link>: شرح سريع لكل حاجة.
        </li>
      </ul>
    </>
  );
}
