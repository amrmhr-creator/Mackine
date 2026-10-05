import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/site";
import ForgotForm from "./ForgotForm";

export const metadata = { title: "نسيت الباسورد" };

export default function Page() {
  return (
    <section className="admin-login">
      <Image src="/logo.png" alt={SITE.name} width={180} height={47} />
      <h1>نسيت الباسورد</h1>
      <ForgotForm />
      <p>
        <Link href="/admin/login">→ الرجوع لصفحة الدخول</Link>
      </p>
    </section>
  );
}
