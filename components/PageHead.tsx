import Link from "next/link";

/** The blue title band at the top of inner pages, with the breadcrumb trail. */
export default function PageHead({
  title,
  lead,
  trail = [],
}: {
  title: string;
  lead?: string;
  trail?: { name: string; href: string }[];
}) {
  return (
    <div className="page-head">
      <div className="wrap">
        {trail.length > 0 && (
          <nav className="crumbs" aria-label="مكانك في الموقع">
            <Link href="/">الرئيسية</Link>
            {trail.map((t) => (
              <span key={t.href}>
                <span aria-hidden="true"> / </span>
                <Link href={t.href}>{t.name}</Link>
              </span>
            ))}
          </nav>
        )}
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
      </div>
    </div>
  );
}
