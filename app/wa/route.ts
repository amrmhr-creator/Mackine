import { getSettings } from "@/lib/settings";

// Every WhatsApp button links here, so the number is changed once in /admin/settings.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { whatsappNumber } = await getSettings();
  const text = new URL(req.url).searchParams.get("text")?.slice(0, 500) ?? "";
  if (!whatsappNumber) return Response.redirect(new URL("/contact", req.url), 302);
  const target = `https://wa.me/${whatsappNumber}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  return Response.redirect(target, 302);
}
