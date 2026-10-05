import Image from "next/image";
import Link from "next/link";
import { NAV, SITE } from "@/lib/site";

export default function Header() {
  return (
    <header className="site-header">
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
