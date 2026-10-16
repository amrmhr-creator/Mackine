import Link from "next/link";
import CategoryCard from "@/components/CategoryCard";
import FaqList from "@/components/FaqList";
import JsonLd from "@/components/JsonLd";
import QuoteForm from "@/components/QuoteForm";
import QuoteSection from "@/components/QuoteSection";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { visibleBrands, visibleCategories, visibleFaq } from "@/lib/catalog-data";
import { catalogLd, faqLd } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/site";

export default async function Home() {
  const [s, categories, brands, faq] = await Promise.all([getSettings(), visibleCategories(), visibleBrands(), visibleFaq()]);
  const homeFaq = faq.slice(0, 5);
  const codes = categories.flatMap((c) => c.codes.slice(0, 1)).slice(0, 5);

  return (
    <>
      <JsonLd data={catalogLd(categories)} />
      {homeFaq.length > 0 && <JsonLd data={faqLd(homeFaq)} />}

      <div className="hero">
        <div className="wrap hero-grid">
          <div>
            <h1>{s.heroTitle}</h1>
            <p className="lead">{s.heroLead}</p>
            {codes.length > 0 && (
              <p className="spec">
                <span>أرقام زي:</span>
                {codes.map((code) => (
                  <span key={code} className="ltr code">
                    {code}
                  </span>
                ))}
              </p>
            )}
            {s.whatsappNumber && (
              <a className="btn btn-wa" href={whatsappLink()}>
                <WhatsAppIcon /> أو ابعت صورة القطعة واتساب
              </a>
            )}
          </div>
          <div className="hero-form">
            <h2>اطلب عرض سعر</h2>
            <QuoteForm short />
          </div>
        </div>
      </div>

      <section id="products">
        <div className="wrap">
          <div className="head">
            <h2>المنتجات</h2>
            <p>عندك رقم قطعة، أو مقاس، أو حتى صورة للقطعة القديمة؟ ده كفاية نبدأ بيه.</p>
          </div>
          <div className="cats">
            {categories.map((c) => (
              <CategoryCard key={c.slug} c={c} />
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="band">
        <div className="wrap">
          <div className="head">
            <h2>إزاي بنشتغل</h2>
          </div>
          <ol className="steps">
            {s.homeSteps.map((step) => (
              <li key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          {s.sectors.length > 0 && (
            <p className="sectors">
              <b>بنورّد لـ:</b> {s.sectors.join("، ")}.
            </p>
          )}
          {brands.length > 0 && (
            <>
              <h3 className="sub-head">ماركات بنورّدها</h3>
              <ul className="brands">
                {brands.map((b) => (
                  <li key={b.id}>
                    {b.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.logo} alt={b.name} loading="lazy" />
                    ) : (
                      b.name
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      {homeFaq.length > 0 && (
        <section>
          <div className="wrap narrow">
            <div className="head">
              <h2>أسئلة بتتسأل كتير</h2>
            </div>
            <FaqList items={homeFaq} />
            <p className="more-link">
              <Link href="/faq">كل الأسئلة ←</Link>
            </p>
          </div>
        </section>
      )}

      <QuoteSection />
    </>
  );
}
