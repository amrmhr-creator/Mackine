import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { backupIfDue } from "@/lib/backup";
import { logoutAction } from "../actions";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "الرئيسية" },
  { href: "/admin/leads", label: "الطلبات" },
  { href: "/admin/categories", label: "الأقسام" },
  { href: "/admin/brands", label: "الماركات" },
  { href: "/admin/faq", label: "الأسئلة" },
  { href: "/admin/images", label: "الصور" },
  { href: "/admin/settings", label: "الإعدادات" },
  { href: "/admin/trash", label: "السلة" },
  { href: "/admin/backups", label: "النسخ الاحتياطية" },
  { href: "/admin/account", label: "حسابي" },
  { href: "/admin/guide", label: "الدليل" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  backupIfDue();
  return (
    <>
      <header className="admin-bar">
        <div className="wrap admin-bar-inner">
          <strong>لوحة تحكم ماكين</strong>
          <nav>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}>
                {n.label}
              </Link>
            ))}
            <Link href="/" target="_blank">
              الموقع ↗
            </Link>
          </nav>
          <form action={logoutAction}>
            <button type="submit" className="admin-logout">
              خروج
            </button>
          </form>
        </div>
      </header>
      <div className="wrap admin-body">{children}</div>
    </>
  );
}
