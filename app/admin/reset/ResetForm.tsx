"use client";

import { useActionState } from "react";
import { resetPasswordAction, type PasswordFormState } from "../actions";

export default function ResetForm({ token, minLength }: { token: string; minLength: number }) {
  const [state, action, pending] = useActionState<PasswordFormState, FormData>(resetPasswordAction, { error: "", done: false });
  return (
    <form action={action} className="admin-form">
      <input type="hidden" name="token" value={token} />
      <label>
        الباسورد الجديد ({minLength} حرف أو رقم على الأقل)
        <input name="password" type="password" required minLength={minLength} autoComplete="new-password" autoFocus dir="ltr" />
      </label>
      <label>
        اكتبه تاني
        <input name="confirm" type="password" required minLength={minLength} autoComplete="new-password" dir="ltr" />
      </label>
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <button className="btn btn-red btn-block" type="submit" disabled={pending}>
        {pending ? "بيتحفظ..." : "احفظ الباسورد وادخل"}
      </button>
    </form>
  );
}
