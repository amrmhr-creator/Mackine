import type { Metadata } from "next";
import CategoryCard from "@/components/CategoryCard";
import JsonLd from "@/components/JsonLd";
import PageHead from "@/components/PageHead";
import QuoteSection from "@/components/QuoteSection";
import { visibleCategories } from "@/lib/catalog-data";
import { breadcrumbLd, catalogLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "المنتجات",
  description: "كل اللي ماكين بتورّده للمصانع: رولمان بلي، وكراسي بلي، وحركة خطية، وبول سكرو، وجلب، وسيور، ونقل حركة، وأويل سيل، وقطع غيار عامة.",
};

export default async function ProductsPage() {
  const categories = await visibleCategories();
  return (
    <>
      <JsonLd data={catalogLd(categories)} />
      <JsonLd data={breadcrumbLd([{ name: "الرئيسية", path: "/" }, { name: "المنتجات", path: "/products" }])} />
      <PageHead
        title="المنتجات"
        lead="اختار القسم عشان تشوف الأنواع وأمثلة الأرقام. ولو القطعة مش هنا، ابعتها برضه."
        trail={[{ name: "المنتجات", href: "/products" }]}
      />
      <section>
        <div className="wrap">
          <div className="cats">
            {categories.map((c) => (
              <CategoryCard key={c.slug} c={c} />
            ))}
          </div>
        </div>
      </section>
      <QuoteSection />
    </>
  );
}
