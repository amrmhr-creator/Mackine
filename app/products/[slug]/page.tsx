import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import CategoryView from "@/components/views/CategoryView";
import { brandsFor, findCategory } from "@/lib/catalog-data";

// Categories merged into others in October 2026. Their old links go to the category that has them now
// (only while no category with that link exists, so one re-created from the panel still works).
const MERGED: Record<string, string> = {
  "bearing-units": "bearings",
  "ball-screws": "linear-motion",
  bushings: "general-parts",
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await findCategory(decodeURIComponent((await params).slug));
  if (!c) return {};
  return {
    title: c.seoTitle || `${c.name}: توريد للمصانع`,
    description: c.seoDescription || c.answer.slice(0, 160),
  };
}

export default async function CategoryPage({ params }: Props) {
  const slug = decodeURIComponent((await params).slug);
  const c = await findCategory(slug);
  if (!c) {
    if (Object.hasOwn(MERGED, slug) && (await findCategory(MERGED[slug]))) permanentRedirect(`/products/${MERGED[slug]}`);
    notFound();
  }
  return <CategoryView c={c} brands={await brandsFor(c.slug)} />;
}
