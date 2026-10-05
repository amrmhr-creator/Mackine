import { readFile } from "node:fs/promises";
import path from "node:path";
import { isImageName, uploadsDir } from "@/lib/uploads";

// Serves photos uploaded from the admin panel. Names are random and never reused,
// so browsers may keep a copy for a long time.
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!isImageName(file)) return new Response("Not found", { status: 404 });
  try {
    const body = await readFile(path.join(uploadsDir(), file));
    return new Response(new Uint8Array(body), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
