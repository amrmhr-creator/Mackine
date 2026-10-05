import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { adminEnabled, isAdmin } from "@/lib/admin-auth";
import { SITE } from "@/lib/site";
import { loginAction } from "../actions";

export const metadata = { title: "دخول" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <section className="admin-login">
      <Image src="/logo.png" alt={SITE.name} width={180} height={47} />
      <h1>لوحة التحكم</h1>
      {!(await adminEnabled()) ? (
        <p className="notice">
          اللوحة مقفولة لحد ما يتحط باسورد في hPanel: Environment variables ← <code dir="ltr">ADMIN_PASSWORD</code> (8 حروف
          على الأقل)، وبعدها build جديد.
        </p>
      ) : (
        <form action={loginAction} className="admin-form">
          <label>
            الباسورد
            <input name="password" type="password" required autoComplete="current-password" autoFocus dir="ltr" />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="btn btn-red btn-block" type="submit">
            دخول
          </button>
        </form>
      )}
      {(await adminEnabled()) && (
        <p>
          <Link href="/admin/forgot">نسيت الباسورد؟</Link>
        </p>
      )}
    </section>
  );
}
