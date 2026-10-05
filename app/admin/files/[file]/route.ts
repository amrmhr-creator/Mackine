import { readFile } from "node:fs/promises";
import path from "node:path";
import { isAdmin } from "@/lib/admin-auth";
import { leadFilesDir } from "@/lib/leads";

// Photos and PDFs customers attached to their requests: only for whoever is logged in to the panel.
const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", pdf: "application/pdf" };

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const { file } = await params;
  const ext = /^[a-z0-9]+-[a-f0-9]{6}-\d\.(jpg|png|webp|pdf)$/.exec(file)?.[1];
  if (!ext) return new Response("Not found", { status: 404 });
  try {
    const body = await readFile(path.join(leadFilesDir(), file));
    return new Response(new Uint8Array(body), {
      headers: { "Content-Type": TYPES[ext], "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
