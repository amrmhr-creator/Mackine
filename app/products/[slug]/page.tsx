import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryView from "@/components/views/CategoryView";
import { brandsFor, findCategory } from "@/lib/catalog-data";

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
  const c = await findCategory(decodeURIComponent((await params).slug));
  if (!c) notFound();
  return <CategoryView c={c} brands={await brandsFor(c.slug)} />;
}
