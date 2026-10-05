import "server-only";
import { randomBytes } from "node:crypto";
import type { Brand } from "./brands";
import { brandsStore, categoriesStore, faqStore } from "./catalog-data";
import type { Category } from "./categories";
import type { FaqItem } from "./faq";
import { leadsStore, type Lead } from "./leads";
import { addToTrash } from "./trash";

// Changes made from the admin panel to categories, brands, questions and requests.
// Deleting moves the item to the trash with its place in the list, so it comes back where it was.

export class CatalogError extends Error {}

const newId = (prefix: string) => `${prefix}-${randomBytes(3).toString("hex")}`;

/** Moves item i one step up (-1) or down (+1). */
function move<T>(list: T[], i: number, dir: -1 | 1) {
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return false;
  [list[i], list[j]] = [list[j], list[i]];
  return true;
}

// ---------- Categories ----------

export type CategoryInput = Omit<Category, "slug">;

/** Saves a category (new when `slug` is null). Returns its link part. */
export async function saveCategory(slug: string | null, input: CategoryInput, wantedSlug = "") {
  const all = await categoriesStore.read();
  if (slug) {
    const i = all.findIndex((c) => c.slug === slug);
    if (i < 0) throw new CatalogError("القسم ده مش موجود.");
    all[i] = { ...input, slug };
  } else {
    const wanted = wantedSlug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
    if (wanted && all.some((c) => c.slug === wanted)) throw new CatalogError("فيه قسم تاني بنفس اللينك. اختار لينك تاني.");
    slug = wanted || newId("cat");
    all.push({ ...input, slug });
  }
  await categoriesStore.write(all);
  return slug;
}

export async function moveCategory(slug: string, dir: -1 | 1) {
  const all = await categoriesStore.read();
  if (move(all, all.findIndex((c) => c.slug === slug), dir)) await categoriesStore.write(all);
}

export async function setCategoryVisible(slug: string, visible: boolean) {
  const all = await categoriesStore.read();
  const c = all.find((x) => x.slug === slug);
  if (!c) return;
  c.visible = visible;
  await categoriesStore.write(all);
}

export async function deleteCategory(slug: string) {
  const all = await categoriesStore.read();
  const index = all.findIndex((c) => c.slug === slug);
  if (index < 0) return;
  const [category] = all.splice(index, 1);
  await categoriesStore.write(all);
  await addToTrash("category", category.name, { category, index });
}

export async function restoreCategory(data: { category: Category; index: number }) {
  const all = await categoriesStore.read();
  if (all.some((c) => c.slug === data.category.slug)) return;
  all.splice(Math.min(data.index, all.length), 0, data.category);
  await categoriesStore.write(all);
}

// ---------- Brands ----------

export type BrandInput = Omit<Brand, "id">;

export async function saveBrand(id: string | null, input: BrandInput) {
  const all = await brandsStore.read();
  const sameName = all.find((b) => b.name.toLowerCase() === input.name.toLowerCase() && b.id !== id);
  if (sameName) throw new CatalogError(`الماركة ${input.name} موجودة قبل كده.`);
  if (id) {
    const i = all.findIndex((b) => b.id === id);
    if (i < 0) throw new CatalogError("الماركة دي مش موجودة.");
    all[i] = { ...input, id };
  } else {
    all.push({ ...input, id: newId("brand") });
  }
  await brandsStore.write(all);
}

export async function moveBrand(id: string, dir: -1 | 1) {
  const all = await brandsStore.read();
  if (move(all, all.findIndex((b) => b.id === id), dir)) await brandsStore.write(all);
}

export async function deleteBrand(id: string) {
  const all = await brandsStore.read();
  const index = all.findIndex((b) => b.id === id);
  if (index < 0) return;
  const [brand] = all.splice(index, 1);
  await brandsStore.write(all);
  await addToTrash("brand", brand.name, { brand, index });
}

export async function restoreBrand(data: { brand: Brand; index: number }) {
  const all = await brandsStore.read();
  if (all.some((b) => b.id === data.brand.id)) return;
  all.splice(Math.min(data.index, all.length), 0, data.brand);
  await brandsStore.write(all);
}

// ---------- General questions ----------

export async function saveQuestion(id: string | null, input: Omit<FaqItem, "id">) {
  const all = await faqStore.read();
  if (id) {
    const i = all.findIndex((q) => q.id === id);
    if (i < 0) throw new CatalogError("السؤال ده مش موجود.");
    all[i] = { ...input, id };
  } else {
    all.push({ ...input, id: newId("q") });
  }
  await faqStore.write(all);
}

export async function moveQuestion(id: string, dir: -1 | 1) {
  const all = await faqStore.read();
  if (move(all, all.findIndex((q) => q.id === id), dir)) await faqStore.write(all);
}

export async function deleteQuestion(id: string) {
  const all = await faqStore.read();
  const index = all.findIndex((q) => q.id === id);
  if (index < 0) return;
  const [question] = all.splice(index, 1);
  await faqStore.write(all);
  await addToTrash("question", question.q, { question, index });
}

export async function restoreQuestion(data: { question: FaqItem; index: number }) {
  const all = await faqStore.read();
  if (all.some((q) => q.id === data.question.id)) return;
  all.splice(Math.min(data.index, all.length), 0, data.question);
  await faqStore.write(all);
}

// ---------- Requests ----------

export async function setLeadStatus(id: string, status: Lead["status"]) {
  const all = await leadsStore.read();
  const lead = all.find((l) => l.id === id);
  if (!lead) return;
  lead.status = status;
  await leadsStore.write(all);
}

export async function deleteLead(id: string) {
  const all = await leadsStore.read();
  const lead = all.find((l) => l.id === id);
  if (!lead) return;
  await leadsStore.write(all.filter((l) => l !== lead));
  await addToTrash("lead", `${lead.name}${lead.company ? ` - ${lead.company}` : ""}`, lead);
}

export async function restoreLead(lead: Lead) {
  const all = await leadsStore.read();
  if (all.some((l) => l.id === lead.id)) return;
  all.push(lead);
  all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  await leadsStore.write(all);
}
