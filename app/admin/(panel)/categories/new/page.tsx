import { requireAdmin } from "@/lib/admin-auth";
import { listImages, imageUrl, smallUrl } from "@/lib/uploads";
import CategoryForm from "../CategoryForm";

export const metadata = { title: "قسم جديد" };

export default async function Page() {
  await requireAdmin();
  const images = (await listImages()).map((i) => ({ url: imageUrl(i.name), thumb: smallUrl(i.name), alt: i.alt }));
  return (
    <>
      <div className="admin-title">
        <h1>قسم جديد</h1>
      </div>
      <CategoryForm images={images} />
    </>
  );
}
