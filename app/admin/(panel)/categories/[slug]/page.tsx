import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { findCategory } from "@/lib/catalog-data";
import { listImages, imageUrl, smallUrl } from "@/lib/uploads";
import CategoryForm from "../CategoryForm";

export const metadata = { title: "تعديل قسم" };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const category = await findCategory(decodeURIComponent((await params).slug), { includeHidden: true });
  if (!category) notFound();
  const images = (await listImages()).map((i) => ({ url: imageUrl(i.name), thumb: smallUrl(i.name), alt: i.alt }));
  return (
    <>
      <div className="admin-title">
        <h1>تعديل: {category.name}</h1>
      </div>
      <CategoryForm category={category} images={images} />
    </>
  );
}
