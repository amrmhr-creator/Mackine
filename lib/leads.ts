import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { dataDir } from "./data-dir";
import { jsonStore } from "./json-file";
import { escapeHtml, sendMail } from "./mail";

// Quote requests: saved to leads.json in the data folder (the admin panel lists them) and
// emailed to LEADS_EMAIL. If either channel works, the request counts as received.

export type LeadPhoto = { file: string; name: string; type: string; size: number };

export type Lead = {
  id: string;
  createdAt: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  category: string;
  details: string;
  photos: LeadPhoto[];
  page: string;
  status: "new" | "done";
};

export const leadsStore = jsonStore<Lead[]>("leads.json", () => []);

export const leadFilesDir = () => path.join(dataDir(), "lead-files");

// Only one request at a time edits leads.json in this process (Hostinger runs several
// processes, so a rare collision is still possible; the email is the backup copy).
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>) {
  const run = queue.then(fn, fn);
  queue = run.catch(() => {});
  return run;
}

async function saveLead(lead: Lead) {
  await serial(async () => {
    const all = await leadsStore.read();
    all.unshift(lead);
    await leadsStore.write(all);
  });
}

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" };

export async function submitLead(
  input: Omit<Lead, "id" | "createdAt" | "photos" | "status">,
  files: { name: string; type: string; data: Buffer }[],
) {
  const id = `${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`;
  const photos: LeadPhoto[] = files.map((f, i) => ({
    file: `${id}-${i + 1}.${EXT[f.type]}`,
    name: f.name.slice(0, 120),
    type: f.type,
    size: f.data.length,
  }));
  const lead: Lead = { ...input, id, createdAt: new Date().toISOString(), photos, status: "new" };

  let saved = false;
  try {
    await mkdir(leadFilesDir(), { recursive: true });
    await Promise.all(files.map((f, i) => writeFile(path.join(leadFilesDir(), photos[i].file), f.data)));
    await saveLead(lead);
    saved = true;
  } catch (err) {
    console.error(`[leads] pid ${process.pid}: save failed:`, err);
  }

  let emailed = false;
  try {
    emailed = await sendLeadEmail(lead, files);
  } catch (err) {
    console.error(`[leads] pid ${process.pid}: email failed:`, err);
  }

  if (!saved && !emailed) throw new Error("lead not saved and not emailed");
  return lead;
}

async function sendLeadEmail(lead: Lead, files: { name: string; type: string; data: Buffer }[]) {
  const to = process.env.LEADS_EMAIL || process.env.SMTP_USER;
  if (!to) return false;
  const rows: [string, string][] = [
    ["الاسم", lead.name],
    ["الشركة / المصنع", lead.company],
    ["الموبايل", lead.phone],
    ["الإيميل", lead.email],
    ["القسم", lead.category],
    ["القطع والكميات", lead.details],
    ["الصفحة", lead.page],
  ];
  const filled = rows.filter(([, v]) => v);
  const text = filled.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px"><h2>طلب عرض سعر جديد</h2><table cellpadding="6">${filled
    .map(([k, v]) => `<tr><td style="color:#555;vertical-align:top"><b>${escapeHtml(k)}</b></td><td style="white-space:pre-wrap">${escapeHtml(v)}</td></tr>`)
    .join("")}</table>${files.length ? `<p>مرفق ${files.length} ملف.</p>` : ""}</div>`;
  return sendMail({
    to,
    subject: `طلب عرض سعر: ${lead.category || "عام"} - ${lead.company || lead.name}`,
    text,
    html,
    replyTo: lead.email || undefined,
    attachments: files.map((f, i) => ({ filename: lead.photos[i].file, content: f.data, contentType: f.type })),
  });
}
