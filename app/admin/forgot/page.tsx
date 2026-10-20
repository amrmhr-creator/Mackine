import Logo from "@/components/Logo";
import Link from "next/link";
import ForgotForm from "./ForgotForm";

export const metadata = { title: "نسيت الباسورد" };

export default function Page() {
  return (
    <section className="admin-login">
      <Logo />
      <h1>نسيت الباسورد</h1>
      <ForgotForm />
      <p>
        <Link href="/admin/login">→ الرجوع لصفحة الدخول</Link>
      </p>
    </section>
  );
}
