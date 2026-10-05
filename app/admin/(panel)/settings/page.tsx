import { requireAdmin } from "@/lib/admin-auth";
import { SETTINGS_GROUPS, savedSettings } from "@/lib/settings";
import SettingsForm from "./SettingsForm";

export const metadata = { title: "الإعدادات" };

export default async function Page() {
  await requireAdmin();
  const values = await savedSettings();

  return (
    <>
      <div className="admin-title">
        <h1>الإعدادات</h1>
      </div>
      <p className="muted">
        اللي تكتبه هنا بيظهر على الموقع على طول. لو مسحت خانة وسبتها فاضية، الموقع بيرجع للكلام الأصلي.
      </p>
      <SettingsForm groups={SETTINGS_GROUPS} values={values} />
    </>
  );
}
