import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";
import { requireAdmin } from "@/lib/admin-auth";
import { faqStore } from "@/lib/catalog-data";
import type { FaqItem } from "@/lib/faq";
import { moveQuestionAction, saveQuestionAction } from "../../actions";

export const metadata = { title: "الأسئلة الشائعة" };

function QuestionForm({ item }: { item?: FaqItem }) {
  return (
    <form action={saveQuestionAction} className="admin-form wide">
      {item && <input type="hidden" name="id" value={item.id} />}
      <label>
        السؤال
        <input name="q" required maxLength={300} defaultValue={item?.q} />
      </label>
      <label>
        الإجابة
        <textarea name="a" required maxLength={3000} rows={4} defaultValue={item?.a} />
      </label>
      <label className="check">
        <input type="checkbox" name="visible" defaultChecked={item ? item.visible : true} />
        ظاهر على الموقع
      </label>
      <button className="btn btn-red" type="submit">
        {item ? "احفظ" : "ضيف السؤال"}
      </button>
    </form>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string; error?: string }> }) {
  await requireAdmin();
  const [{ saved, deleted, error }, items] = await Promise.all([searchParams, faqStore.read()]);

  return (
    <>
      <div className="admin-title">
        <h1>الأسئلة الشائعة</h1>
      </div>
      {saved && <p className="admin-saved">✓ اتحفظ.</p>}
      {deleted && <p className="admin-saved">✓ السؤال راح سلة المهملات.</p>}
      {error && <p className="form-error">اكتب السؤال والإجابة.</p>}
      <p className="muted">
        دي الأسئلة العامة (صفحة الأسئلة الشائعة، وأول 5 منها في الرئيسية). أسئلة كل قسم بتتعدل من صفحة{" "}
        <Link href="/admin/categories">الأقسام</Link>.
      </p>

      <table className="admin-table">
        <tbody>
          {items.map((item, i) => (
            <tr key={item.id} className={item.visible ? "" : "is-hidden"}>
              <td>
                <details>
                  <summary>
                    <strong>{item.q}</strong>
                    {!item.visible && <span className="tag">مخفي</span>}
                  </summary>
                  <QuestionForm item={item} />
                </details>
              </td>
              <td className="admin-row-actions">
                <form action={moveQuestionAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button className="btn btn-sm btn-outline" name="dir" value="up" disabled={i === 0} aria-label="طلّعه">
                    ↑
                  </button>
                  <button className="btn btn-sm btn-outline" name="dir" value="down" disabled={i === items.length - 1} aria-label="نزّله">
                    ↓
                  </button>
                </form>
                <DeleteButton kind="question" itemKey={item.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>سؤال جديد</h2>
      <QuestionForm />
    </>
  );
}
