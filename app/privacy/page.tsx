import type { Metadata } from "next";
import PageHead from "@/components/PageHead";
import QuoteSection from "@/components/QuoteSection";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "سياسة الخصوصية" };

export default async function PrivacyPage() {
  const s = await getSettings();
  return (
    <>
      <PageHead title="سياسة الخصوصية" trail={[{ name: "سياسة الخصوصية", href: "/privacy" }]} />
      <section>
        <div className="wrap narrow prose">
          <h2>البيانات اللي بنجمعها</h2>
          <p>
            لما تبعت طلب عرض سعر، بنحتفظ بالبيانات اللي كتبتها: الاسم، واسم الشركة، ورقم الموبايل، والإيميل لو كتبته، وتفاصيل
            الطلب والملفات اللي رفعتها.
          </p>
          <h2>بنستخدمها في إيه</h2>
          <p>بنستخدمها عشان نراجع طلبك ونتواصل معاك بعرض السعر والتوريد بس. ما بنبيعهاش ولا بنديها لحد، غير لو القانون طلب كده.</p>
          <h2>بنحفظها فين</h2>
          <p>الطلبات بتتحفظ على سيرفر الموقع وبتوصل على إيميل الشركة. وتقدر تطلب مننا نمسح بياناتك في أي وقت.</p>
          <h2>الكوكيز</h2>
          <p>الموقع دلوقتي ما بيستخدمش كوكيز للتتبع أو الإعلانات.</p>
          {(s.email || s.whatsappNumber) && (
            <>
              <h2>للتواصل بخصوص بياناتك</h2>
              <p>
                {s.email && <span className="ltr">{s.email}</span>}
                {s.email && s.whatsappNumber && " أو واتساب "}
                {s.whatsappNumber && <span className="ltr">{s.whatsappDisplay}</span>}
              </p>
            </>
          )}
        </div>
      </section>
      <QuoteSection />
    </>
  );
}
