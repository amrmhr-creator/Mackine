import { MIN_PASSWORD, ownerAccount } from "@/lib/admin-accounts";
import { requireAdmin } from "@/lib/admin-auth";
import ChangePasswordForm from "./ChangePasswordForm";

export const metadata = { title: "حسابي" };

export default async function Page() {
  await requireAdmin();
  const owner = await ownerAccount();
  const changedAt = owner?.passwordHash ? new Date(owner.passwordChangedAt) : null;
  const resetEmail = !!process.env.ADMIN_EMAIL?.trim();

  return (
    <>
      <div className="admin-title">
        <h1>حسابي</h1>
      </div>
      <ul className="muted">
        <li>
          {changedAt
            ? `آخر تغيير للباسورد: ${changedAt.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" })}.`
            : "لسه بتدخل بالباسورد المكتوب في إعدادات Hostinger. غيّره من هنا لباسورد خاص بيك."}
        </li>
        <li>
          {resetEmail
            ? "لو نسيت الباسورد، دوس «نسيت الباسورد» في صفحة الدخول، وهيجيلك لينك على إيميلك الشخصي."
            : "استرجاع الباسورد بالإيميل مش متفعّل لسه (محتاج ADMIN_EMAIL في إعدادات Hostinger)."}
        </li>
      </ul>
      <ChangePasswordForm minLength={MIN_PASSWORD} />
    </>
  );
}
