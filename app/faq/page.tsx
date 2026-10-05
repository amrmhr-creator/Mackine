import type { Metadata } from "next";
import Link from "next/link";
import FaqList from "@/components/FaqList";
import JsonLd from "@/components/JsonLd";
import PageHead from "@/components/PageHead";
import QuoteSection from "@/components/QuoteSection";
import { visibleCategories, visibleFaq } from "@/lib/catalog-data";
import { categoryHref } from "@/lib/categories";
import { breadcrumbLd, faqLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة",
  description: "إزاي تطلب عرض سعر من ماكين، ولو مش عارف رقم القطعة تعمل إيه، والكميات والماركات والفواتير والتوريد.",
};

export default async function FaqPage() {
  const [faq, categories] = await Promise.all([visibleFaq(), visibleCategories()]);
  const withQuestions = categories.filter((c) => c.faq.length > 0);
  const all = [...faq, ...withQuestions.flatMap((c) => c.faq)];
  return (
    <>
      {all.length > 0 && <JsonLd data={faqLd(all)} />}
      <JsonLd data={breadcrumbLd([{ name: "الرئيسية", path: "/" }, { name: "الأسئلة الشائعة", path: "/faq" }])} />
      <PageHead title="الأسئلة الشائعة" trail={[{ name: "الأسئلة الشائعة", href: "/faq" }]} />
      <section>
        <div className="wrap narrow">
          <h2 className="sub-head">عن الطلب والتوريد</h2>
          <FaqList items={faq} />
          {withQuestions.map((c) => (
            <div key={c.slug}>
              <h2 className="sub-head">
                <Link href={categoryHref(c)}>{c.name}</Link>
              </h2>
              <FaqList items={c.faq} />
            </div>
          ))}
        </div>
      </section>
      <QuoteSection />
    </>
  );
}
