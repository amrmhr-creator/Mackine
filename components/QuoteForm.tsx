"use client";

import { useState } from "react";

type Option = { slug: string; name: string };

/** The quote request form. Sends to /api/quote (saved + emailed), with up to 3 photos or PDFs. */
export default function QuoteForm({ categories, defaultCategory = "" }: { categories: Option[]; defaultCategory?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("page", window.location.pathname);
    setError("");
    setState("sending");
    try {
      const res = await fetch("/api/quote", { method: "POST", body: data });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "حصلت مشكلة. جرّب تاني.");
      form.reset();
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "حصلت مشكلة. جرّب تاني.");
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <div className="quote-form sent" role="status">
        <h3>وصل طلبك، شكراً!</h3>
        <p>هنراجعه ونرجعلك بعرض السعر في أقرب وقت على الموبايل اللي كتبته.</p>
        <button type="button" className="btn btn-outline" onClick={() => setState("idle")}>
          ابعت طلب تاني
        </button>
      </div>
    );
  }

  return (
    <form className="quote-form" onSubmit={onSubmit} noValidate={false}>
      <div className="f">
        <label htmlFor="q-name">الاسم</label>
        <input id="q-name" name="name" required minLength={2} maxLength={80} autoComplete="name" />
      </div>
      <div className="f">
        <label htmlFor="q-company">الشركة / المصنع</label>
        <input id="q-company" name="company" maxLength={120} autoComplete="organization" />
      </div>
      <div className="f">
        <label htmlFor="q-phone">رقم الموبايل (واتساب)</label>
        <input id="q-phone" name="phone" type="tel" required maxLength={20} autoComplete="tel" dir="ltr" className="ltr-input" />
      </div>
      <div className="f">
        <label htmlFor="q-email">
          الإيميل <small>(اختياري)</small>
        </label>
        <input id="q-email" name="email" type="email" maxLength={120} autoComplete="email" dir="ltr" className="ltr-input" />
      </div>
      <div className="f full">
        <label htmlFor="q-category">نوع المنتج</label>
        <select id="q-category" name="category" defaultValue={defaultCategory}>
          <option value="">اختار (أو سيبها لو الطلب فيه أكتر من نوع)</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="f full">
        <label htmlFor="q-details">القطع المطلوبة والكميات</label>
        <textarea
          id="q-details"
          name="details"
          maxLength={3000}
          placeholder={"رقم القطعة أو مقاسها، والكمية. كل قطعة في سطر.\nمثلاً: 6205-2RS × 40"}
        />
      </div>
      <div className="f full">
        <label htmlFor="q-files">
          صورة القطعة أو القايمة <small>(اختياري: لحد 3 ملفات، صور أو PDF)</small>
        </label>
        <input id="q-files" name="files" type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" />
      </div>
      {/* Honeypot for bots: hidden from people and screen readers. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="q-website">سيب الخانة دي فاضية</label>
        <input id="q-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="form-foot">
        <button className="btn btn-red" type="submit" disabled={state === "sending"}>
          {state === "sending" ? "جاري الإرسال…" : "ابعت الطلب"}
        </button>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
