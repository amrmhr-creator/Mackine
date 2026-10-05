import { NextResponse } from "next/server";
import { categoriesStore } from "@/lib/catalog-data";
import { submitLead } from "@/lib/leads";

// Spam brake: 10 requests per IP per 10 minutes. Only successes count.
// The counter lives in this process's memory, and Hostinger runs several app processes,
// so each keeps its own count: the real limit is looser than 10, never stricter.
const LIMIT = 10;
const WINDOW_MS = 10 * 60_000;
const hits = new Map<string, number[]>();
function recentHits(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.set(ip, recent);
  return recent;
}

function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0].trim();
  return forwarded || req.headers.get("x-real-ip")?.trim() || null;
}

const clean = (v: FormDataEntryValue | null, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const westernDigits = (s: string) => s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

const MAX_FILES = 3;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

/** The real type from the first bytes (the browser's claim isn't trusted). */
function sniff(data: Buffer) {
  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return "image/jpeg";
  if (data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (data.subarray(0, 4).toString("latin1") === "RIFF" && data.subarray(8, 12).toString("latin1") === "WEBP") return "image/webp";
  if (data.subarray(0, 5).toString("latin1") === "%PDF-") return "application/pdf";
  return null;
}

const bad = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return bad("الطلب ما وصلش كامل. جرّب تاني.");
  }

  // Honeypot: a field people never see. Bots fill it; pretend it worked.
  if (clean(form.get("website"), 200)) return NextResponse.json({ ok: true });

  const ip = clientIp(req);
  if (ip && recentHits(ip).length >= LIMIT) return bad("بعت طلبات كتير ورا بعض. استنى شوية وجرّب تاني، أو كلمنا واتساب.", 429);

  const name = clean(form.get("name"), 80);
  const company = clean(form.get("company"), 120);
  const phone = westernDigits(clean(form.get("phone"), 30));
  const email = clean(form.get("email"), 120);
  const categorySlug = clean(form.get("category"), 80);
  const details = clean(form.get("details"), 3000);
  const page = clean(form.get("page"), 200);

  if (name.length < 2) return bad("اكتب اسمك.");
  if (!/^\+?[\d\s-]{8,20}$/.test(phone) || phone.replace(/\D/g, "").length < 8) return bad("اكتب رقم موبايل صحيح.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad("الإيميل مش مظبوط.");

  const files: { name: string; type: string; data: Buffer }[] = [];
  for (const entry of form.getAll("files")) {
    if (typeof entry === "string" || entry.size === 0) continue;
    if (files.length >= MAX_FILES) return bad(`ممكن ترفع ${MAX_FILES} ملفات بالكتير.`);
    if (entry.size > MAX_FILE_BYTES) return bad("كل ملف لازم يكون أقل من 5 ميجا.");
    const data = Buffer.from(await entry.arrayBuffer());
    const type = sniff(data);
    if (!type) return bad("الملفات المسموحة: صور (JPG أو PNG أو WebP) أو PDF.");
    files.push({ name: entry.name || "file", type, data });
  }
  if (details.length < 3 && files.length === 0) return bad("اكتب القطع المطلوبة، أو ارفع صورة القطعة.");

  const categories = await categoriesStore.read();
  const category = categories.find((c) => c.slug === categorySlug)?.name ?? "";

  try {
    await submitLead({ name, company, phone, email, category, details, page }, files);
  } catch {
    return bad("حصلت مشكلة وإحنا بنستلم الطلب. جرّب تاني، أو ابعته على الواتساب.", 500);
  }
  if (ip) recentHits(ip).push(Date.now());
  return NextResponse.json({ ok: true });
}
