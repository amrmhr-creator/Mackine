import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Readex_Pro } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import SiteChrome from "@/components/SiteChrome";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { visibleBrands } from "@/lib/catalog-data";
import { organizationLd } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { SITE } from "@/lib/site";
import "./globals.css";

const display = Readex_Pro({ subsets: ["arabic", "latin"], weight: ["500", "700"], display: "swap", variable: "--font-display" });
const body = IBM_Plex_Sans_Arabic({ subsets: ["arabic", "latin"], weight: ["400", "500", "600"], display: "swap", variable: "--font-body" });

// Texts, contact details and the catalog come from the admin panel, so pages render on request.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { tagline } = await getSettings();
  return {
    metadataBase: new URL(SITE.url),
    title: { default: `${SITE.name} ${SITE.nameEn} | رولمان بلي وسيور وقطع غيار صناعية`, template: `%s | ${SITE.name} ${SITE.nameEn}` },
    description: `${tagline}. ابعت رقم القطعة أو صورتها ونرجعلك بعرض سعر مكتوب.`,
    openGraph: { siteName: `${SITE.name} ${SITE.nameEn}`, locale: "ar_EG", type: "website" },
    // Pre-launch noindex; the switch is ALLOW_INDEXING in next.config.mjs.
    robots: process.env.ALLOW_INDEXING === "true" ? undefined : { index: false, follow: false },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, brands] = await Promise.all([getSettings(), visibleBrands()]);
  return (
    <html lang="ar" dir="rtl" className={`${display.variable} ${body.variable}`}>
      <body>
        <JsonLd data={organizationLd(settings, brands)} />
        <SiteChrome>
          <Header />
        </SiteChrome>
        <main>{children}</main>
        <SiteChrome>
          <Footer />
          <WhatsAppFloat />
        </SiteChrome>
      </body>
    </html>
  );
}
