import { requireAdmin } from "@/lib/admin-auth";
import { TRASH_DAYS, TRASH_KIND_LABEL, daysLeft, listTrash } from "@/lib/trash";
import { purgeItemAction, restoreItemAction } from "../../actions";
import PurgeButton from "./PurgeButton";

export const metadata = { title: "سلة المهملات" };

export default async function Page({ searchParams }: { searchParams: Promise<{ restored?: string }> }) {
  await requireAdmin();
  const [{ restored }, entries] = await Promise.all([searchParams, listTrash()]);

  return (
    <>
      <div className="admin-title">
        <h1>سلة المهملات</h1>
      </div>
      <p className="muted">
        أي حاجة بتمسحها بتستنى هنا {TRASH_DAYS} يوم، وتقدر ترجّعها زي ما كانت. بعد كده بتتمسح نهائي لوحدها.
      </p>
      {restored && (
        <p className="admin-saved" role="status">
          <strong>✓ رجعت مكانها.</strong>
        </p>
      )}
      {entries.length === 0 ? (
        <p className="muted">السلة فاضية.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>اللي اتمسح</th>
              <th>النوع</th>
              <th>هيتمسح نهائي بعد</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td>{e.title}</td>
                <td>{TRASH_KIND_LABEL[e.kind]}</td>
                <td className="nowrap">{daysLeft(e)} يوم</td>
                <td className="admin-row-actions">
                  <form action={restoreItemAction}>
                    <input type="hidden" name="id" value={e.id} />
                    <button className="btn btn-red btn-sm" type="submit">
                      رجّعه
                    </button>
                  </form>
                  <PurgeButton id={e.id} action={purgeItemAction} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
