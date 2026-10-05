import Image from "next/image";
import Link from "next/link";
import { visibleCategories } from "@/lib/catalog-data";
import { categoryHref } from "@/lib/categories";
import { getSettings } from "@/lib/settings";
import { LEGAL, NAV, SITE, whatsappLink } from "@/lib/site";

export default async function Footer() {
  const [s, categories] = await Promise.all([getSettings(), visibleCategories()]);
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <Image src="/logo-white.png" alt={SITE.nameEn} width={170} height={44} />
          <p className="footer-tagline">{s.tagline}</p>
          {s.social.length > 0 && (
            <ul className="social">
              {s.social.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2>المنتجات</h2>
          <ul>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={categoryHref(c)}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>ماكين</h2>
          <ul>
            {[...NAV.filter((l) => l.href !== "/products"), ...LEGAL].map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>تواصل معانا</h2>
          <ul className="contact-lines">
            {s.whatsappNumber && (
              <li>
                <a href={whatsappLink()} className="ltr">
                  واتساب: {s.whatsappDisplay}
                </a>
              </li>
            )}
            {s.phone && (
              <li>
                <a href={`tel:${s.phone.replace(/[^\d+]/g, "")}`} className="ltr">
                  {s.phone}
                </a>
              </li>
            )}
            {s.email && (
              <li>
                <a href={`mailto:${s.email}`} className="ltr">
                  {s.email}
                </a>
              </li>
            )}
            {s.address && <li>{s.address}</li>}
            {s.hours && <li>{s.hours}</li>}
          </ul>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>
          © {year} {s.business.legalName || `${SITE.name} ${SITE.nameEn}`}
        </span>
        {s.business.commercialRegister && <span>سجل تجاري: {s.business.commercialRegister}</span>}
        {s.business.taxId && <span>بطاقة ضريبية: {s.business.taxId}</span>}
      </div>
    </footer>
  );
}
