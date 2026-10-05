"use client";

import { deleteItemAction } from "@/app/admin/actions";

/** "امسح" in the admin lists: asks first, then moves the item to the trash. */
export default function DeleteButton({ kind, itemKey, label = "امسح" }: { kind: string; itemKey: string; label?: string }) {
  return (
    <form
      action={deleteItemAction}
      onSubmit={(e) => {
        if (!window.confirm("متأكد؟ هيروح سلة المهملات، وتقدر ترجّعه منها خلال 30 يوم.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="key" value={itemKey} />
      <button className="btn btn-outline btn-sm admin-delete" type="submit">
        {label}
      </button>
    </form>
  );
}
