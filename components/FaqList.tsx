import type { QA } from "@/lib/categories";

/** Questions that open on tap. The answers stay in the page for search engines. */
export default function FaqList({ items }: { items: QA[] }) {
  return (
    <div className="faq">
      {items.map((item) => (
        <details key={item.q}>
          <summary>
            <h3>{item.q}</h3>
          </summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  );
}
