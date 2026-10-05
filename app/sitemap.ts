import type { MetadataRoute } from "next";
import { visibleCategories } from "@/lib/catalog-data";
import { categoryHref } from "@/lib/categories";
import { LEGAL, NAV, SITE } from "@/lib/site";

// Categories come from the admin panel, so the sitemap is built on each request.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => ({ url: `${SITE.url}${path}` });
  const pages = ["", ...NAV.map((l) => l.href), ...LEGAL.map((l) => l.href)];
  const categories = (await visibleCategories()).map((c) => url(categoryHref(c)));
  return [...pages.map(url), ...categories];
}
