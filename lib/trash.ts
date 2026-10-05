import "server-only";
import { randomBytes } from "node:crypto";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { dataDir } from "./data-dir";
import { jsonStore } from "./json-file";

// The trash: anything deleted in the admin panel (categories, brands, questions, photos,
// requests) waits here 30 days and can be restored; after that it's removed for good.
// Each data module puts its own item in and knows how to put it back (app/admin/actions.ts).

export const TRASH_DAYS = 30;

export type TrashKind = "category" | "brand" | "question" | "image" | "lead";

export type TrashEntry = {
  id: string;
  kind: TrashKind;
  title: string;
  deletedAt: number;
  data: unknown;
};

export const TRASH_KIND_LABEL: Record<TrashKind, string> = {
  category: "قسم",
  brand: "ماركة",
  question: "سؤال",
  image: "صورة",
  lead: "طلب",
};

const store = jsonStore<TrashEntry[]>("trash.json", () => []);
const expired = (e: TrashEntry) => Date.now() - e.deletedAt > TRASH_DAYS * 86_400_000;

/** Removes the files a deleted photo or request leaves on disk. */
async function removeFiles(entry: TrashEntry) {
  const files: string[] = [];
  if (entry.kind === "image") {
    const name = (entry.data as { image?: { name?: string } }).image?.name ?? "";
    if (/^[a-f0-9]{24}\.webp$/.test(name)) files.push(path.join("uploads", name), path.join("uploads", name.replace(/\.webp$/, "-sm.webp")));
  }
  if (entry.kind === "lead") {
    for (const p of (entry.data as { photos?: { file?: string }[] }).photos ?? []) {
      if (p.file && /^[\w.-]+$/.test(p.file)) files.push(path.join("lead-files", p.file));
    }
  }
  for (const f of files) await unlink(path.join(dataDir(), f)).catch(() => {});
}

async function read() {
  const data = await store.read();
  return Array.isArray(data) ? data : [];
}

/** Everything in the trash, newest first, after clearing out what's older than 30 days. */
export async function listTrash() {
  const entries = await read();
  const old = entries.filter(expired);
  if (old.length) {
    for (const e of old) await removeFiles(e);
    await store.write(entries.filter((e) => !expired(e)));
  }
  return entries.filter((e) => !expired(e)).sort((a, b) => b.deletedAt - a.deletedAt);
}

export async function addToTrash(kind: TrashKind, title: string, data: unknown) {
  const entries = await read();
  entries.push({ id: randomBytes(6).toString("hex"), kind, title, deletedAt: Date.now(), data });
  await store.write(entries);
}

/** Takes an entry out of the trash (to restore it). */
export async function takeFromTrash(id: string) {
  const entries = await read();
  const entry = entries.find((e) => e.id === id);
  if (!entry) return undefined;
  await store.write(entries.filter((e) => e.id !== id));
  return entry;
}

/** Deletes an entry for good, right now. */
export async function purgeFromTrash(id: string) {
  const entry = await takeFromTrash(id);
  if (entry) await removeFiles(entry);
}

export function daysLeft(entry: TrashEntry) {
  return Math.max(0, Math.ceil((entry.deletedAt + TRASH_DAYS * 86_400_000 - Date.now()) / 86_400_000));
}
