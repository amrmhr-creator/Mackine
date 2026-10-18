import Link from "next/link";
import CategoryIcon from "@/components/CategoryIcon";
import JsonLd from "@/components/JsonLd";
import QuoteForm from "@/components/QuoteForm";
import QuoteSection from "@/components/QuoteSection";
import { visibleBrands, visibleCategories } from "@/lib/catalog-data";
import { categoryHref, type Category } from "@/lib/categories";
import { catalogLd } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

/** A line drawing of a 6205 bearing with its real sizes (mm), on the hero's blueprint grid. */
function BearingDrawing() {
  const balls = [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
    const r = (deg * Math.PI) / 180;
    return { x: 210 + 118 * Math.sin(r), y: 195 - 118 * Math.cos(r) };
  });
  return (
    <svg className="hero-drawing" viewBox="0 0 420 420" role="img" aria-label="رسم هندسي لبلية 6205: القطر الداخلي 25 مللي والخارجي 52 والسُمك 15">
      <g className="axis">
        <line x1="210" y1="24" x2="210" y2="368" />
        <line x1="22" y1="195" x2="398" y2="195" />
      </g>
      <g className="rings">
        <circle cx="210" cy="195" r="160" strokeWidth="2.5" />
        <circle cx="210" cy="195" r="136" />
        <circle cx="210" cy="195" r="100" />
        <circle cx="210" cy="195" r="77" strokeWidth="2.5" />
      </g>
      <g className="balls">
        {balls.map((b) => (
          <circle key={`${b.x}-${b.y}`} cx={b.x} cy={b.y} r="16" />
        ))}
      </g>
      <g className="dims">
        <line x1="50" y1="355" x2="50" y2="398" />
        <line x1="370" y1="355" x2="370" y2="398" />
        <line x1="56" y1="390" x2="364" y2="390" />
        <polyline points="64,385 54,390 64,395" />
        <polyline points="356,385 366,390 356,395" />
        <line x1="133" y1="203" x2="287" y2="203" />
      </g>
      <g className="labels" textAnchor="middle">
        <text x="210" y="384">D = 52</text>
        <text x="210" y="190">d = 25</text>
        <text x="210" y="16">6205-2RS · B = 15</text>
      </g>
    </svg>
  );
}

function Tile({ c, big = false }: { c: Category; big?: boolean }) {
  return (
    <Link href={categoryHref(c)} className={`tile${big ? " tile-big" : ""}`}>
      <div className="tile-media">
        {c.image ? (
          // Uploaded photos are already resized and compressed.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.image} alt="" loading="lazy" />
        ) : (
          <CategoryIcon name={c.icon} size={big ? 120 : 64} />
        )}
      </div>
      <div className="tile-text">
        <h3>{c.name}</h3>
        {big ? <p>{c.short}</p> : null}
        {c.codes.length > 0 && <span className="mono ltr">{c.codes.slice(0, big ? 4 : 2).join(" · ")}</span>}
      </div>
    </Link>
  );
}

export default async function Home() {
  const [s, categories, brands] = await Promise.all([getSettings(), visibleCategories(), visibleBrands()]);
  const [first, ...rest] = categories;
  const middle = rest.slice(0, 4);
  const small = rest.slice(4);
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]));

  return (
    <>
      <JsonLd data={catalogLd(categories)} />

      <section className="hero blueprint">
        <div className="wrap hero-grid">
          <div className="hero-text">
            <p className="hero-tags ltr" aria-hidden="true">
              BEARINGS · BELTS · CHAINS · SEALS · TOOLS
            </p>
            <h1>{s.heroTitle}</h1>
            <p className="lead">{s.heroLead}</p>
          </div>
          <BearingDrawing />
        </div>
      </section>

      <div className="wrap hero-form-wrap">
        <div className="hero-form">
          <QuoteForm short />
        </div>
      </div>

      {first && (
        <section id="products" className="home-products">
          <div className="wrap">
            <div className="row-head">
              <h2>بنورّد إيه</h2>
              <Link href="/products">كل المنتجات ←</Link>
            </div>
            <div className="bento">
              <Tile c={first} big />
              {middle.map((c) => (
                <Tile key={c.slug} c={c} />
              ))}
            </div>
            {small.length > 0 && (
              <div className="tiles-small">
                {small.map((c) => (
                  <Link key={c.slug} href={categoryHref(c)} className="tile-line">
                    <span>{c.name}</span>
                    <small>{c.short}</small>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {brands.length > 0 && (
        <section id="brands" className="band home-brands">
          <div className="wrap">
            <div className="row-head">
              <h2>ماركات بنورّدها</h2>
              <p>ولو الماركة مش متاحة، بنقترح بديل بنفس المواصفات ونقولك الفرق في السعر.</p>
            </div>
            <ul className="brand-grid">
              {brands.map((b) => (
                <li key={b.id}>
                  {b.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.logo} alt={b.name} loading="lazy" />
                  ) : (
                    <b>{b.name}</b>
                  )}
                  {b.categories[0] && categoryName.get(b.categories[0]) && <small>{categoryName.get(b.categories[0])}</small>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section id="how" className="home-how">
        <div className="wrap how-grid">
          <div>
            <h2>من الطلب للتوريد</h2>
            <ol className="how-steps">
              {s.homeSteps.map((step, i) => (
                <li key={step.title}>
                  <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <figure className="quote-sample" aria-label="مثال لشكل عرض السعر">
            <div className="qs-head">
              <span>عرض سعر</span>
              <span>مثال</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>الصنف</th>
                  <th>الماركة</th>
                  <th>الكمية</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="mono ltr">6205-2RS</td>
                  <td>اللي تطلبها أو بديل</td>
                  <td>40</td>
                </tr>
                <tr>
                  <td className="mono ltr">B-62</td>
                  <td>اللي تطلبها أو بديل</td>
                  <td>6</td>
                </tr>
              </tbody>
            </table>
            <div className="qs-foot">
              <span>ميعاد التوريد وتكلفة التوصيل</span>
              <span>مكتوبين في العرض</span>
            </div>
            <figcaption>شكل عرض السعر اللي بيوصلك: مكتوب، وفيه كل حاجة قبل ما توافق.</figcaption>
          </figure>
        </div>
      </section>

      <section className="band home-about">
        <div className="wrap narrow">
          <h2>مين احنا</h2>
          <p className="about-lead">{s.aboutLead}</p>
          {s.sectors.length > 0 && (
            <p className="sectors">
              <b>بنورّد لـ:</b> {s.sectors.join("، ")}.
            </p>
          )}
          <p className="more-link">
            <Link href="/about">اعرف أكتر عن مكين ←</Link>
          </p>
        </div>
      </section>

      <QuoteSection />
    </>
  );
}
