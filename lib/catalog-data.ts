import "server-only";
import { DEFAULT_BRANDS, type Brand } from "./brands";
import { DEFAULT_CATEGORIES, type Category } from "./categories";
import { DEFAULT_FAQ, type FaqItem } from "./faq";
import { jsonStore } from "./json-file";

// The catalog the admin panel edits, saved as JSON files in the data folder.
// Until the first save, each file falls back to the starting content in lib/.

export const categoriesStore = jsonStore<Category[]>("categories.json", () => structuredClone(DEFAULT_CATEGORIES));
export const brandsStore = jsonStore<Brand[]>("brands.json", () => structuredClone(DEFAULT_BRANDS));
export const faqStore = jsonStore<FaqItem[]>("faq.json", () => structuredClone(DEFAULT_FAQ));

export async function visibleCategories() {
  return (await categoriesStore.read()).filter((c) => c.visible);
}

/** A category by its link, hidden ones included only when asked (admin preview). */
export async function findCategory(slug: string, { includeHidden = false } = {}) {
  const c = (await categoriesStore.read()).find((x) => x.slug === slug);
  return c && (c.visible || includeHidden) ? c : null;
}

export async function visibleBrands() {
  return (await brandsStore.read()).filter((b) => b.visible);
}

export async function brandsFor(slug: string) {
  return (await visibleBrands()).filter((b) => b.categories.includes(slug));
}

export async function visibleFaq() {
  return (await faqStore.read()).filter((f) => f.visible);
}
