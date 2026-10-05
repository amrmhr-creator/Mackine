import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import PageHead from "@/components/PageHead";
import QuoteSection from "@/components/QuoteSection";
import { breadcrumbLd } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "تواصل معانا",
  description: "اطلب عرض سعر من ماكين على قطع الغيار الصناعية: من الفورم أو على الواتساب.",
};

export default async function ContactPage() {
  const s = await getSettings();
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "الرئيسية", path: "/" }, { name: "تواصل معانا", path: "/contact" }])} />
      <PageHead
        title="تواصل معانا"
        lead="أسرع طريقة: ابعت رقم القطعة أو صورتها والكمية، ونرجعلك بعرض سعر مكتوب."
        trail={[{ name: "تواصل معانا", href: "/contact" }]}
      />
      {(s.address || s.mapUrl) && (
        <section className="tight">
          <div className="wrap narrow">
            {s.address && (
              <p>
                <strong>العنوان: </strong>
                {s.address}
              </p>
            )}
            {s.mapUrl && (
              <p>
                <a href={s.mapUrl} target="_blank" rel="noopener noreferrer">
                  افتح المكان على خرائط جوجل
                </a>
              </p>
            )}
          </div>
        </section>
      )}
      <QuoteSection />
    </>
  );
}
