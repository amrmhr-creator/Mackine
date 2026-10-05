// Fixed facts about the site. Contact details and texts the owner can change live in
// lib/settings.ts (edited from the admin panel); empty values are hidden on the site.

export const SITE = {
  name: "ماكين",
  nameEn: "Mackine",
  /** The public address. Set SITE_URL in hPanel once the domain is decided. */
  url: (process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, ""),
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
