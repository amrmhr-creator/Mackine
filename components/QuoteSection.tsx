import { visibleCategories } from "@/lib/catalog-data";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/site";
import QuoteForm from "./QuoteForm";
import WhatsAppIcon from "./WhatsAppIcon";

/** The "request a quote" band at the bottom of every page (the header button jumps here). */
export default async function QuoteSection({
  category,
  title = "قولّنا محتاج إيه، ونرجعلك بالسعر",
}: {
  category?: { slug: string; name: string };
  title?: string;
}) {
  const [s, categories] = await Promise.all([getSettings(), visibleCategories()]);
  const waText = category ? `السلام عليكم، محتاج عرض سعر على ${category.name}.` : undefined;
  return (
    <section id="quote" className="quote">
      <div className="wrap quote-grid">
        <div>
          <span className="eyebrow">اطلب عرض سعر</span>
          <h2>{title}</h2>
          <p className="quote-lead">
            املا الفورم{s.whatsappNumber ? " أو ابعت صورة القطعة على الواتساب مباشرة" : ""}. كل ما التفاصيل تبقى أوضح، عرض السعر
            بيوصلك أسرع.
          </p>
          <ul className="contact-list">
            {s.whatsappNumber && (
              <li>
                <small>واتساب</small>
                <span className="ltr">{s.whatsappDisplay}</span>
              </li>
            )}
            {s.phone && (
              <li>
                <small>تليفون</small>
                <span className="ltr">{s.phone}</span>
              </li>
            )}
            {s.email && (
              <li>
                <small>إيميل</small>
                <span className="ltr">{s.email}</span>
              </li>
            )}
            {s.hours && (
              <li>
                <small>مواعيد العمل</small>
                <span>{s.hours}</span>
              </li>
            )}
          </ul>
          {s.whatsappNumber && (
            <a className="btn btn-wa" href={whatsappLink(waText)}>
              <WhatsAppIcon /> ابعت على الواتساب
            </a>
          )}
        </div>
        <QuoteForm categories={categories.map(({ slug, name }) => ({ slug, name }))} defaultCategory={category?.slug} />
      </div>
    </section>
  );
}
