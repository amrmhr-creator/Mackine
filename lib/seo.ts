// Schema.org JSON-LD builders, rendered with components/JsonLd.

import type { Brand } from "./brands";
import { categoryHref, type Category, type QA } from "./categories";
import type { SiteSettings } from "./settings";
import { SITE } from "./site";

const ORG_ID = `${SITE.url}/#organization`;

export function organizationLd(s: SiteSettings, brands: Brand[]) {
  const phone = s.phone || (s.whatsappNumber && `+${s.whatsappNumber}`);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.name,
    alternateName: SITE.nameEn,
    ...(s.business.legalName && { legalName: s.business.legalName }),
    ...(s.business.taxId && { taxID: s.business.taxId }),
    description: s.tagline,
    url: SITE.url,
    logo: `${SITE.url}/logo.png`,
    ...(phone && { telephone: phone }),
    ...(s.email && { email: s.email }),
    areaServed: "EG",
    knowsAbout: ["رولمان بلي", "سيور", "نقل حركة", "قطع غيار صناعية", "Bearings", "Belts", "Power transmission"],
    ...(brands.length > 0 && { brand: brands.map((b) => ({ "@type": "Brand", name: b.name })) }),
    ...(s.address && { address: { "@type": "PostalAddress", streetAddress: s.address, addressCountry: "EG" } }),
    ...((phone || s.email) && {
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        ...(phone && { telephone: phone }),
        ...(s.email && { email: s.email }),
        availableLanguage: ["ar", "en"],
      },
    }),
    ...(s.social.length > 0 && { sameAs: s.social.map((link) => link.href) }),
  };
}

/** The product catalog: one OfferCatalog with a list per category. */
export function catalogLd(categories: Category[]) {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: `منتجات ${SITE.name}`,
    url: `${SITE.url}/products`,
    itemListElement: categories.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      url: `${SITE.url}${categoryHref(c)}`,
      description: c.short,
    })),
  };
}

/** A category page: the product types it covers, sold by the organization. */
export function categoryLd(c: Category, brands: Brand[]) {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: c.name,
    description: c.answer,
    url: `${SITE.url}${categoryHref(c)}`,
    provider: { "@id": ORG_ID },
    itemListElement: c.types.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: t.name,
        description: t.text,
        category: c.name,
        ...(brands.length > 0 && { brand: brands.map((b) => ({ "@type": "Brand", name: b.name })) }),
      },
    })),
  };
}

export function faqLd(items: QA[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: `${SITE.url}${t.path}` })),
  };
}
