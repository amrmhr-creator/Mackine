"use client";

import { useActionState } from "react";
import { requestResetAction, type PasswordFormState } from "../actions";

export default function ForgotForm() {
  const [state, action, pending] = useActionState<PasswordFormState, FormData>(requestResetAction, { error: "", done: false });

  if (state.done) {
    return (
      <p className="admin-saved" role="status">
        <strong>✓ بعتنالك لينك على إيميلك الشخصي.</strong> افتحه خلال نص ساعة. لو مش لاقيه، بص في الـ Spam.
      </p>
    );
  }
  return (
    <form action={action} className="admin-form">
      <p>هنبعت لينك لتغيير الباسورد على إيميلك الشخصي. اللينك بيشتغل مرة واحدة ولمدة نص ساعة.</p>
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <button className="btn btn-red btn-block" type="submit" disabled={pending}>
        {pending ? "بيتبعت..." : "ابعتلي اللينك"}
      </button>
    </form>
  );
}
