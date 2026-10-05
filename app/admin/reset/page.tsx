import Image from "next/image";
import Link from "next/link";
import { MIN_PASSWORD, resetTokenValid } from "@/lib/admin-accounts";
import { SITE } from "@/lib/site";
import ResetForm from "./ResetForm";

export const metadata = { title: "باسورد جديد" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  const valid = token.length > 20 && (await resetTokenValid(token));

  return (
    <section className="admin-login">
      <Image src="/logo.png" alt={SITE.name} width={180} height={47} />
      <h1>باسورد جديد</h1>
      {valid ? (
        <ResetForm token={token} minLength={MIN_PASSWORD} />
      ) : (
        <p className="notice">
          اللينك ده انتهى أو اتستخدم قبل كده. <Link href="/admin/forgot">اطلب لينك جديد</Link>.
        </p>
      )}
    </section>
  );
}
