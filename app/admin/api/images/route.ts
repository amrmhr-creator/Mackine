import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { MAX_UPLOAD_BYTES, UploadError, saveImage } from "@/lib/uploads";

// Photo upload from /admin/images. It sits under /admin because the login cookie is only
// sent there. A route handler rather than a server action,
// because server actions refuse bodies over 1 MB and phone photos are bigger.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "لازم تدخل لوحة التحكم الأول." }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "اختار صورة." }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "الصورة أكبر من 15 ميجا." }, { status: 400 });

  try {
    const image = await saveImage(Buffer.from(await file.arrayBuffer()), String(form?.get("alt") ?? ""));
    return NextResponse.json({ image });
  } catch (err) {
    if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(`[uploads] pid ${process.pid}: upload failed:`, err);
    return NextResponse.json({ error: "حصلت مشكلة في حفظ الصورة، جرّب تاني." }, { status: 500 });
  }
}
