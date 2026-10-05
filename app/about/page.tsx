import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import PageHead from "@/components/PageHead";
import QuoteSection from "@/components/QuoteSection";
import { breadcrumbLd } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "مين احنا",
  description: "ماكين وسيط توريد لقطع الغيار الصناعية: رولمان بلي، وسيور، ونقل حركة، وقطع غيار المصانع.",
};

export default async function AboutPage() {
  const s = await getSettings();
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "الرئيسية", path: "/" }, { name: "مين احنا", path: "/about" }])} />
      <PageHead title="مين احنا" lead={s.aboutLead} trail={[{ name: "مين احنا", href: "/about" }]} />
      <section>
        <div className="wrap narrow prose">
          {s.aboutStory.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
          <h2>ليه ماكين</h2>
          <div className="why">
            {s.homeWhy.map((w) => (
              <div key={w.title}>
                <h3>{w.title}</h3>
                <p>{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <QuoteSection />
    </>
  );
}
