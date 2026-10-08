// Fixed facts about the site. Contact details and texts the owner can change live in
// lib/settings.ts (edited from the admin panel); empty values are hidden on the site.

/**
 * The public address from SITE_URL, cleaned up so a value typed by hand in hPanel
 * ("mackine.net", quotes, spaces) can never take the whole site down.
 */
function siteUrl(): string {
  const fallback = process.env.NODE_ENV === "production" ? "https://mackine.net" : "http://localhost:3000";
  let raw = (process.env.SITE_URL || "").trim().replace(/^["']|["']$/g, "").trim();
  if (!raw) return fallback;
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  try {
    return new URL(raw).origin;
  } catch {
    console.warn(`SITE_URL "${process.env.SITE_URL}" is not a valid address; using ${fallback}`);
    return fallback;
  }
}

export const SITE = {
  name: "ماكين",
  nameEn: "Mackine",
  /** The public address. Set SITE_URL in hPanel, e.g. https://mackine.net */
  url: siteUrl(),
  tagline: "ماكين لتوريد قطع الغيار الصناعية: رولمان بلي، وسيور، ونقل حركة، وقطع غيار المصانع",
};

export type NavLink = { href: string; label: string };

export const NAV: NavLink[] = [
  { href: "/products", label: "المنتجات" },
  { href: "/about", label: "مين احنا" },
  { href: "/faq", label: "الأسئلة الشائعة" },
  { href: "/contact", label: "تواصل معانا" },
];

export const LEGAL: NavLink[] = [{ href: "/privacy", label: "سياسة الخصوصية" }];

/** Ready-made WhatsApp message, sent through /wa so the number is changed in one place. */
export function whatsappLink(text = "السلام عليكم، محتاج عرض سعر على قطع غيار.") {
  return `/wa?text=${encodeURIComponent(text)}`;
}
