import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-head">
      <div className="wrap">
        <h1>الصفحة دي مش موجودة</h1>
        <p className="lead">
          ممكن اللينك اتغيّر. <Link href="/products">شوف كل المنتجات</Link> أو <Link href="/contact">كلمنا</Link>.
        </p>
      </div>
    </div>
  );
}
