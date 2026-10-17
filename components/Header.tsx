import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { NAV, SITE, whatsappLink } from "@/lib/site";

export default async function Header() {
  const s = await getSettings();
  return (
    <header className="site-header">
      {(s.whatsappNumber || s.phone || s.hours) && (
        <div className="topbar">
          <div className="wrap topbar-in">
            {s.whatsappNumber && (
              <a href={whatsappLink()}>
                واتساب <span className="ltr">{s.whatsappDisplay}</span>
              </a>
            )}
            {s.phone && (
              <a href={`tel:${s.phone.replace(/[^\d+]/g, "")}`}>
                تليفون <span className="ltr">{s.phone}</span>
              </a>
            )}
            {s.hours && <span className="topbar-hours">{s.hours}</span>}
          </div>
        </div>
      )}
      <div className="wrap nav">
        <Link href="/" className="brand" aria-label={`${SITE.name} - الرئيسية`}>
          <Image src="/logo.png" alt={`${SITE.name} ${SITE.nameEn}`} width={180} height={47} priority />
        </Link>
        <nav aria-label="القائمة">
          <ul className="nav-links">
            {NAV.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav-end">
          <Link className="btn btn-red" href="#quote">
            اطلب عرض سعر
          </Link>
          {/* Phone menu without JavaScript: a details box. */}
          <details className="menu">
            <summary aria-label="القائمة">
              <span />
              <span />
              <span />
            </summary>
            <ul>
              {NAV.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    </header>
  );
}
