// /llms.txt: a plain summary of the business and its main pages for AI assistants (llmstxt.org).
import { visibleBrands, visibleCategories } from "@/lib/catalog-data";
import { categoryHref } from "@/lib/categories";
import { getSettings } from "@/lib/settings";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET() {
  const [s, categories, brands] = await Promise.all([getSettings(), visibleCategories(), visibleBrands()]);
  const u = (path: string) => `${SITE.url}${path}`;
  const contact = [
    s.whatsappNumber && `واتساب +${s.whatsappNumber}`,
    s.phone && `تليفون ${s.phone}`,
    s.email && `إيميل ${s.email}`,
    s.address && `العنوان: ${s.address}`,
  ].filter(Boolean);

  const text = `# ${SITE.name} (${SITE.nameEn})

> ${SITE.name} شركة مصرية بتشتغل كوسيط توريد لقطع الغيار الصناعية للمصانع والورش: رولمان بلي، وسيور، ونقل حركة، وحركة خطية، وقطع غيار عامة. العميل يبعت رقم القطعة أو صورتها أو مقاسها والكمية، وماكين ترجعله بعرض سعر مكتوب وميعاد توريد، وتورّد لحد المصنع.

${contact.length ? `- التواصل: ${contact.join("، ")}.` : ""}
${s.hours ? `- مواعيد العمل: ${s.hours}.` : ""}
- الطلب: من فورم «اطلب عرض سعر» في أي صفحة${s.whatsappNumber ? " أو على الواتساب" : ""}. مفيش حد أدنى للكمية.
- الماركات: الماركة المطلوبة، أو بديل مكافئ بنفس المواصفات بعد موافقة العميل.${brands.length ? ` من الماركات: ${brands.map((b) => b.name).join("، ")}.` : ""}

## الأقسام

${categories.map((c) => `- [${c.name}](${u(categoryHref(c))}): ${c.answer}`).join("\n")}

## صفحات تانية

- [كل المنتجات](${u("/products")})
- [الأسئلة الشائعة](${u("/faq")})
- [مين احنا](${u("/about")})
- [تواصل معانا](${u("/contact")})
`.replace(/\n{3,}/g, "\n\n");
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
