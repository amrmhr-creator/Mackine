"use client";

import { useActionState } from "react";
import type { FieldGroup } from "@/lib/settings";
import { saveSettingsAction, type FormState } from "../../actions";

/** The settings form. After a failed save it keeps what was typed and shows why. */
export default function SettingsForm({ groups, values }: { groups: FieldGroup[]; values: Record<string, string> }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSettingsAction, {
    error: "",
    saved: false,
    values,
    attempt: 0,
  });

  return (
    // Remounted after each save so the fields show the saved (or typed) values.
    <form key={state.attempt} action={action} className="admin-form admin-settings">
      {state.saved && (
        <p className="admin-saved" role="status">
          <strong>✓ اتحفظ، وظهر على الموقع.</strong>
        </p>
      )}
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      {groups.map((group) => (
        <fieldset key={group.title}>
          <legend>{group.title}</legend>
          {group.note && <p className="muted small">{group.note}</p>}
          {group.fields.map((f) => (
            <label key={f.key}>
              {f.label}
              {f.hint && <small className="muted"> ({f.hint})</small>}
              {f.multiline ? (
                <textarea name={f.key} defaultValue={state.values[f.key] ?? f.fallback} rows={f.key === "about.story" ? 8 : 3} maxLength={3000} />
              ) : (
                <input name={f.key} defaultValue={state.values[f.key] ?? f.fallback} maxLength={300} dir={f.ltr ? "ltr" : undefined} />
              )}
            </label>
          ))}
        </fieldset>
      ))}
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <button className="btn btn-red btn-block" type="submit" disabled={pending}>
        {pending ? "بيتحفظ..." : "احفظ الإعدادات"}
      </button>
    </form>
  );
}
