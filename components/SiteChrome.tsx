"use client";

import { usePathname } from "next/navigation";

/** The site's header, footer and WhatsApp button: hidden inside the admin panel. */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return usePathname().startsWith("/admin") ? null : children;
}
