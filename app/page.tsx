import Link from "next/link";
import CategoryCard from "@/components/CategoryCard";
import FaqList from "@/components/FaqList";
import JsonLd from "@/components/JsonLd";
import QuoteSection from "@/components/QuoteSection";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { visibleBrands, visibleCategories, visibleFaq } from "@/lib/catalog-data";
import { catalogLd, faqLd } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/site";

export default async function Home() {
  const [s, categories, brands, faq] = await Promise.all([getSettings(), visibleCategories(), visibleBrands(), visibleFaq()]);
  const homeFaq = faq.slice(0, 5);
  const codes = categories.flatMap((c) => c.codes.slice(0, 1)).slice(0, 6);

  return (
    <>
      <JsonLd data={catalogLd(categories)} />
      {homeFaq.length > 0 && <JsonLd data={faqLd(homeFaq)} />}

      <div className="hero">
        <div className="wrap hero-grid">
          <div>
            <h1>{s.heroTitle}</h1>
            <p className="lead">{s.heroLead}</p>
            <div className="ctas">
              <a className="btn btn-red btn-lg" href="#quote">
                اطلب عرض سعر
              </a>
              {s.whatsappNumber && (
                <a className="btn btn-wa btn-lg" href={whatsappLink()}>
                  <WhatsAppIcon /> كلمنا واتساب
                </a>
              )}
            </div>
            {codes.length > 0 && (
              <div className="spec" aria-label="أمثلة لأرقام قطع بنورّدها">
                {codes.map((code) => (
                  <span key={code} className="ltr">
                    {code}
                  </span>
                ))}
              </div>
            )}
          </div>
          <svg className="hero-art" viewBox="0 0 360 360" role="img" aria-label="رسم لرولمان بلي">
            <circle cx="180" cy="180" r="170" fill="none" stroke="currentColor" strokeOpacity=".2" strokeWidth="2" />
            <circle cx="180" cy="180" r="150" fill="none" stroke="currentColor" strokeOpacity=".55" strokeWidth="10" />
            <circle cx="180" cy="180" r="80" fill="none" stroke="currentColor" strokeOpacity=".55" strokeWidth="10" />
            <circle cx="180" cy="180" r="48" fill="none" stroke="currentColor" strokeOpacity=".2" strokeWidth="2" strokeDasharray="4 6" />
            <g className="ring">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                const r = (deg * Math.PI) / 180;
                return <circle key={deg} cx={180 + 115 * Math.sin(r)} cy={180 - 115 * Math.cos(r)} r="26" />;
              })}
            </g>
          </svg>
        </div>
      </div>

      <section id="products">
        <div className="wrap">
          <div className="head">
            <span className="eyebrow">اللي بنورّده</span>
            <h2>قطع الغيار اللي خطوط الإنتاج ما تقدرش تستنى عليها</h2>
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
            <span className="eyebrow">إزاي بنشتغل</span>
            <h2>من الطلب لحد باب المصنع في 3 خطوات</h2>
          </div>
          <ol className="steps">
            {s.homeSteps.map((step) => (
              <li key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="why">
        <div className="wrap">
          <div className="head">
            <span className="eyebrow">ليه ماكين</span>
            <h2>وفّر وقت فريق الصيانة، وسيب التدوير علينا</h2>
          </div>
          <div className="why">
            {s.homeWhy.map((w) => (
              <div key={w.title}>
                <h3>{w.title}</h3>
                <p>{w.text}</p>
              </div>
            ))}
          </div>
          {s.sectors.length > 0 && (
            <>
              <h3 className="sub-head">القطاعات اللي بنخدمها</h3>
              <ul className="chips">
                {s.sectors.map((sector) => (
                  <li key={sector}>{sector}</li>
                ))}
              </ul>
            </>
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
        <section className="band">
          <div className="wrap narrow">
            <div className="head">
              <span className="eyebrow">أسئلة شائعة</span>
              <h2>قبل ما تطلب</h2>
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
