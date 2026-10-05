import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { brandsStore, categoriesStore } from "./catalog-data";
import { dataDir } from "./data-dir";
import { jsonStore } from "./json-file";
import { addToTrash } from "./trash";

// Photos uploaded from the admin panel (category photos, brand logos). They live in the data
// folder outside the app (so a new deploy never wipes them) and are served by
// app/uploads/[file]/route.ts. Each upload is saved twice as WebP: a large copy for the site
// and a small one for the admin grid. images.json lists them.

const LARGE_WIDTH = 1600;
const SMALL_WIDTH = 480;
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export type UploadedImage = {
  name: string; // e.g. "3f9a…c2.webp"
  width: number;
  height: number;
  alt: string;
  uploadedAt: string;
};

export const uploadsDir = () => path.join(dataDir(), "uploads");
const library = jsonStore<UploadedImage[]>("images.json", () => []);

/** Only names we generated ourselves, so a request can never reach another file. */
export function isImageName(name: string) {
  return /^[a-f0-9]{24}(-sm)?\.webp$/.test(name);
}

export const imageUrl = (name: string) => `/uploads/${name}`;
export const smallUrl = (name: string) => `/uploads/${name.replace(/\.webp$/, "-sm.webp")}`;
/** "/uploads/abc.webp" → "abc.webp" when it's one of ours, else "". */
export const nameFromUrl = (url: string) => {
  const name = url.replace(/^\/uploads\//, "");
  return url.startsWith("/uploads/") && isImageName(name) ? name : "";
};

/** Newest first. */
export async function listImages() {
  return (await library.read()).slice().reverse();
}

/** Whether the server can resize images (sharp may not load on an old server). */
export async function canResize() {
  try {
    const sharp = (await import("sharp")).default;
    await sharp({ create: { width: 2, height: 2, channels: 3, background: "#fff" } }).webp().toBuffer();
    return true;
  } catch (err) {
    console.error(`[uploads] pid ${process.pid}: sharp unavailable: ${err instanceof Error ? err.message : err}`);
    return false;
  }
}

export class UploadError extends Error {}

/** Resizes, compresses and stores one photo. Throws UploadError with a message to show. */
export async function saveImage(input: Buffer, alt: string): Promise<UploadedImage> {
  let sharp: typeof import("sharp").default;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    throw new UploadError("ضغط الصور مش شغال على السيرفر ده. كلّم المبرمج.");
  }
  const meta = await sharp(input)
    .metadata()
    .catch(() => null);
  if (!meta || !meta.width || !meta.height || !["jpeg", "png", "webp", "gif", "avif", "tiff"].includes(meta.format ?? "")) {
    throw new UploadError("الملف ده مش صورة (ارفع JPG أو PNG أو WebP).");
  }

  const name = `${randomBytes(12).toString("hex")}.webp`;
  await mkdir(uploadsDir(), { recursive: true });
  // rotate() applies the phone's orientation; metadata (like the GPS location) is dropped.
  const large = sharp(input).rotate().resize({ width: LARGE_WIDTH, withoutEnlargement: true }).webp({ quality: 78 });
  const { width, height } = await large.toFile(path.join(uploadsDir(), name));
  await sharp(input)
    .rotate()
    .resize({ width: SMALL_WIDTH, withoutEnlargement: true })
    .webp({ quality: 70 })
    .toFile(path.join(uploadsDir(), name.replace(/\.webp$/, "-sm.webp")));

  const image: UploadedImage = { name, width, height, alt: alt.trim().slice(0, 150), uploadedAt: new Date().toISOString() };
  const all = await library.read();
  all.push(image);
  await library.write(all);
  return image;
}

export async function updateAlt(name: string, alt: string) {
  const all = await library.read();
  const image = all.find((i) => i.name === name);
  if (!image) return;
  image.alt = alt.trim().slice(0, 150);
  await library.write(all);
}

/**
 * Moves a photo to the trash: it leaves the photo list and every category or brand using it.
 * Its files stay on disk until the trash is emptied.
 */
export async function deleteImage(name: string) {
  const all = await library.read();
  const image = all.find((i) => i.name === name);
  if (!image) return;
  const url = imageUrl(name);
  const categories = await categoriesStore.read();
  const brands = await brandsStore.read();
  const usedBy = {
    categories: categories.filter((c) => c.image === url).map((c) => c.slug),
    brands: brands.filter((b) => b.logo === url).map((b) => b.id),
  };
  if (usedBy.categories.length) {
    for (const c of categories) if (c.image === url) c.image = "";
    await categoriesStore.write(categories);
  }
  if (usedBy.brands.length) {
    for (const b of brands) if (b.logo === url) b.logo = "";
    await brandsStore.write(brands);
  }
  await library.write(all.filter((i) => i !== image));
  await addToTrash("image", image.alt || "صورة من غير وصف", { image, usedBy });
}

export async function restoreImage(data: { image: UploadedImage; usedBy: { categories: string[]; brands: string[] } }) {
  const all = await library.read();
  if (!all.some((i) => i.name === data.image.name)) all.push(data.image);
  await library.write(all);
  const url = imageUrl(data.image.name);
  const categories = await categoriesStore.read();
  for (const c of categories) if (data.usedBy.categories.includes(c.slug) && !c.image) c.image = url;
  await categoriesStore.write(categories);
  const brands = await brandsStore.read();
  for (const b of brands) if (data.usedBy.brands.includes(b.id) && !b.logo) b.logo = url;
  await brandsStore.write(brands);
}
