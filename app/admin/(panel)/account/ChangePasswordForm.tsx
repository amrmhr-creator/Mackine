"use client";

import { useActionState } from "react";
import { changePasswordAction, type PasswordFormState } from "../../actions";

export default function ChangePasswordForm({ minLength }: { minLength: number }) {
  const [state, action, pending] = useActionState<PasswordFormState, FormData>(changePasswordAction, { error: "", done: false });

  if (state.done) {
    return (
      <p className="admin-saved" role="status">
        <strong>✓ الباسورد اتغيّر.</strong> من دلوقتي ادخل بالباسورد الجديد. أي جهاز تاني كان داخل اللوحة اتقفل.
      </p>
    );
  }
  return (
    <form action={action} className="admin-form">
      <h3>تغيير الباسورد</h3>
      <label>
        الباسورد الحالي
        <input name="current" type="password" required autoComplete="current-password" dir="ltr" />
      </label>
      <label>
        الباسورد الجديد ({minLength} حرف أو رقم على الأقل)
        <input name="password" type="password" required minLength={minLength} autoComplete="new-password" dir="ltr" />
      </label>
      <label>
        اكتب الباسورد الجديد تاني
        <input name="confirm" type="password" required minLength={minLength} autoComplete="new-password" dir="ltr" />
      </label>
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <button className="btn btn-red btn-block" type="submit" disabled={pending}>
        {pending ? "بيتحفظ..." : "غيّر الباسورد"}
      </button>
    </form>
  );
}
