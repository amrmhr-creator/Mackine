import { requireAdmin } from "@/lib/admin-auth";
import { backupStatus } from "@/lib/backup";
const formatDate = (day: string) => new Date(`${day}T12:00:00Z`).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" });
import { backupNowAction } from "../../actions";
import OpenBackup from "./OpenBackup";

export const metadata = { title: "النسخ الاحتياطية" };

const kb = (bytes: number) => `${Math.max(1, Math.round(bytes / 1024)).toLocaleString("ar-EG")} كيلو`;

export default async function Page({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  await requireAdmin();
  const [{ result }, status] = await Promise.all([searchParams, backupStatus()]);

  return (
    <>
      <div className="admin-title">
        <h1>النسخ الاحتياطية</h1>
      </div>
      <ul className="muted">
        <li>كل يوم الموقع بياخد نسخة لوحده من كل البيانات (الطلبات، والأقسام، والماركات، والأسئلة، والإعدادات) ومن الصور وملفات الطلبات، وبيحتفظ بآخر 14 يوم.</li>
        <li>كل أسبوع بيبعتلك نسخة من البيانات (من غير الصور) على إيميلك الشخصي، في ملف مقفول بباسورد.</li>
      </ul>

      {result === "done" && <p className="admin-saved">✓ اتعملت نسخة دلوقتي.</p>}
      {result === "emailed" && <p className="admin-saved">✓ اتعملت نسخة واتبعتت على إيميلك.</p>}
      {result?.startsWith("email-error:") && (
        <p className="form-error" role="alert">
          النسخة اتعملت على السيرفر، بس الإيميل ما اتبعتش: {result.slice(12)}
        </p>
      )}

      {!status.emailReady && (
        <p className="notice">
          النسخة الأسبوعية على الإيميل مش هتشتغل لحد ما يتحط في إعدادات Hostinger: <code dir="ltr">ADMIN_EMAIL</code> (إيميلك
          الشخصي) و <code dir="ltr">BACKUP_PASSWORD</code> (باسورد للملف، 8 حروف على الأقل، واكتبه عندك في مكان أمين).
        </p>
      )}
      {status.lastError && <p className="form-error">آخر نسخة أوتوماتيك فشلت. اعمل نسخة دلوقتي من الزرار تحت، ولو فشلت كلّم المبرمج.</p>}
      {status.lastEmailError && <p className="form-error">آخر إيميل ما اتبعتش: {status.lastEmailError}</p>}

      <div className="admin-stats admin-stats-small">
        <div className="card">
          <b>{status.lastDay ? formatDate(status.lastDay) : "لسه"}</b>
          آخر نسخة على السيرفر
        </div>
        <div className="card">
          <b>{status.lastEmailDay ? formatDate(status.lastEmailDay) : "لسه"}</b>
          آخر نسخة على الإيميل
        </div>
        <div className="card">
          <b>{status.images.toLocaleString("ar-EG")}</b>
          صورة متنسخة
        </div>
      </div>

      <div className="admin-row-actions">
        <form action={backupNowAction}>
          <button className="btn btn-red" type="submit">
            اعمل نسخة دلوقتي
          </button>
        </form>
        <form action={backupNowAction}>
          <input type="hidden" name="email" value="1" />
          <button className="btn btn-outline" type="submit" disabled={!status.emailReady}>
            اعمل نسخة وابعتها على الإيميل
          </button>
        </form>
      </div>

      {status.days.length > 0 && (
        <>
          <h2>النسخ اللي على السيرفر</h2>
          <table className="admin-table">
            <tbody>
              {status.days.map((d) => (
                <tr key={d.day}>
                  <td>{formatDate(d.day)}</td>
                  <td className="nowrap">{kb(d.size)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted small">لو احتجت ترجّع نسخة منهم، كلّم المبرمج.</p>
        </>
      )}

      <OpenBackup />
    </>
  );
}
