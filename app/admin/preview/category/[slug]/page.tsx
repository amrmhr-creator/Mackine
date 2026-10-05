import { notFound } from "next/navigation";
import CategoryView from "@/components/views/CategoryView";
import { requireAdmin } from "@/lib/admin-auth";
import { brandsFor, findCategory } from "@/lib/catalog-data";

export const metadata = { title: "معاينة قسم" };
export const dynamic = "force-dynamic";

/** The category page as visitors see it (hidden ones too), for whoever is logged in to the panel. */
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const c = await findCategory(decodeURIComponent((await params).slug), { includeHidden: true });
  if (!c) notFound();
  return (
    <>
      <div className="preview-bar">
        معاينة{!c.visible && ": القسم ده مخفي، والزوار مش شايفينه"}. <a href={`/admin/categories/${c.slug}`}>ارجع للتعديل</a>
      </div>
      <CategoryView c={c} brands={await brandsFor(c.slug)} />
    </>
  );
}
