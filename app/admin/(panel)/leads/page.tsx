import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";
import { requireAdmin } from "@/lib/admin-auth";
import { leadsStore } from "@/lib/leads";
import { internationalNumber } from "@/lib/settings";
import { leadStatusAction } from "../../actions";

export const metadata = { title: "الطلبات" };

const FILTERS = [
  { key: "", label: "الكل" },
  { key: "new", label: "جديدة" },
  { key: "done", label: "اتردّ عليها" },
];

const when = (iso: string) =>
  new Date(iso).toLocaleString("ar-EG", { timeZone: "Africa/Cairo", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default async function Page({ searchParams }: { searchParams: Promise<{ show?: string; deleted?: string }> }) {
  await requireAdmin();
  const { show = "", deleted } = await searchParams;
  const all = await leadsStore.read();
  const leads = show === "new" || show === "done" ? all.filter((l) => l.status === show) : all;

  return (
    <>
      <div className="admin-title">
        <h1>الطلبات</h1>
        <a className="btn btn-outline btn-sm" href={`/admin/leads/export${show ? `?show=${show}` : ""}`}>
          نزّلهم Excel
        </a>
      </div>
      {deleted && <p className="admin-saved">✓ الطلب راح سلة المهملات.</p>}
      <nav className="admin-filters">
        {FILTERS.map((f) => (
          <Link key={f.key} href={f.key ? `/admin/leads?show=${f.key}` : "/admin/leads"} className={show === f.key ? "active" : ""}>
            {f.label}
          </Link>
        ))}
      </nav>

      {leads.length === 0 ? (
        <p className="muted">مفيش طلبات هنا لسه.</p>
      ) : (
        <div className="admin-leads">
          {leads.map((l) => (
            <article key={l.id} className={`card lead-card ${l.status}`}>
              <header>
                <strong>{l.name}</strong>
                {l.company && <span> · {l.company}</span>}
                <span className="muted small"> · {when(l.createdAt)}</span>
                {l.status === "new" && <span className="tag">جديد</span>}
              </header>
              <p className="lead-contact">
                <a href={`https://wa.me/${internationalNumber(l.phone)}`} target="_blank" rel="noopener noreferrer" className="ltr">
                  {l.phone}
                </a>
                {l.email && (
                  <>
                    {" · "}
                    <a href={`mailto:${l.email}`} className="ltr">
                      {l.email}
                    </a>
                  </>
                )}
                {l.category && <span> · {l.category}</span>}
              </p>
              {l.details && <p className="lead-details">{l.details}</p>}
              {l.photos.length > 0 && (
                <p className="lead-files">
                  {l.photos.map((p, i) => (
                    <a key={p.file} href={`/admin/files/${p.file}`} target="_blank" rel="noopener noreferrer">
                      {p.type === "application/pdf" ? `ملف PDF ${i + 1}` : `صورة ${i + 1}`}
                    </a>
                  ))}
                </p>
              )}
              <footer className="admin-row-actions">
                <form action={leadStatusAction}>
                  <input type="hidden" name="id" value={l.id} />
                  <input type="hidden" name="filter" value={show} />
                  <input type="hidden" name="status" value={l.status === "new" ? "done" : "new"} />
                  <button className="btn btn-sm btn-outline" type="submit">
                    {l.status === "new" ? "✓ اتردّ عليه" : "رجّعه جديد"}
                  </button>
                </form>
                <DeleteButton kind="lead" itemKey={l.id} />
              </footer>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
