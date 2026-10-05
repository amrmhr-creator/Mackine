import Link from "next/link";
import CategoryIcon from "@/components/CategoryIcon";
import FaqList from "@/components/FaqList";
import JsonLd from "@/components/JsonLd";
import PageHead from "@/components/PageHead";
import QuoteSection from "@/components/QuoteSection";
import type { Brand } from "@/lib/brands";
import { categoryHref, type Category } from "@/lib/categories";
import { breadcrumbLd, categoryLd, faqLd } from "@/lib/seo";

/** A category page. Used by the site and by the admin preview. */
export default function CategoryView({ c, brands }: { c: Category; brands: Brand[] }) {
  return (
    <>
      <JsonLd data={categoryLd(c, brands)} />
      {c.faq.length > 0 && <JsonLd data={faqLd(c.faq)} />}
      <JsonLd
        data={breadcrumbLd([
          { name: "الرئيسية", path: "/" },
          { name: "المنتجات", path: "/products" },
          { name: c.name, path: categoryHref(c) },
        ])}
      />
      <PageHead
        title={c.name}
        trail={[
          { name: "المنتجات", href: "/products" },
          { name: c.name, href: categoryHref(c) },
        ]}
      />

      <section>
        <div className="wrap cat-page">
          <div className="cat-main">
            <div className="answer">
              <h2>الإجابة باختصار</h2>
              <p>{c.answer}</p>
            </div>

            {c.types.length > 0 && (
              <>
                <h2 className="sub-head">الأنواع اللي بنورّدها</h2>
                <div className="types">
                  {c.types.map((t) => (
                    <div key={t.name} className="type">
                      <h3>{t.name}</h3>
                      <p>{t.text}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {c.faq.length > 0 && (
              <>
                <h2 className="sub-head">أسئلة عن {c.name}</h2>
                <FaqList items={c.faq} />
              </>
            )}
          </div>

          <aside className="cat-side">
            <div className="side-box">
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.image} alt={c.name} className="side-photo" />
              ) : (
                <CategoryIcon name={c.icon} size={56} />
              )}
              {c.codes.length > 0 && (
                <>
                  <h2>أمثلة لأرقام بنورّدها</h2>
                  <ul className="code-tags">
                    {c.codes.map((code) => (
                      <li key={code} className="ltr">
                        {code}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {brands.length > 0 && (
                <>
                  <h2>ماركات</h2>
                  <ul className="code-tags">
                    {brands.map((b) => (
                      <li key={b.id}>{b.name}</li>
                    ))}
                  </ul>
                </>
              )}
              <a className="btn btn-red" href="#quote">
                اطلب عرض سعر
              </a>
              <Link href="/products" className="back-link">
                كل المنتجات
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <QuoteSection category={{ slug: c.slug, name: c.name }} title={`محتاج ${c.name}؟ قولّنا الرقم والكمية`} />
    </>
  );
}
