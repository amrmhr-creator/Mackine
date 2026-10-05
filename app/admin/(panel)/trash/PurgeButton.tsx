"use client";

/** "امسح نهائي": asks first, because this can't be undone. */
export default function PurgeButton({ id, action }: { id: string; action: (formData: FormData) => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm("ده هيتمسح نهائي ومش هيرجع تاني. متأكد؟")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="btn btn-outline btn-sm admin-delete" type="submit">
        امسح نهائي
      </button>
    </form>
  );
}
