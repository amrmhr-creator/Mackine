"use client";

import { useState } from "react";

// Opens a weekly backup file (.enc) from the email, right here in the browser: the file and the
// password never leave this computer. Same format as `openssl enc -aes-256-cbc -pbkdf2 -iter 100000 -md sha256`.

async function decrypt(file: ArrayBuffer, password: string) {
  const bytes = new Uint8Array(file);
  if (new TextDecoder().decode(bytes.slice(0, 8)) !== "Salted__") throw new Error("format");
  const salt = bytes.slice(8, 16);
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" }, base, 384));
  const key = await crypto.subtle.importKey("raw", bits.slice(0, 32), "AES-CBC", false, ["decrypt"]);
  return crypto.subtle.decrypt({ name: "AES-CBC", iv: bits.slice(32, 48) }, key, bytes.slice(16));
}

export default function OpenBackup() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const file = (form.elements.namedItem("file") as HTMLInputElement).files?.[0];
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const data = await decrypt(await file.arrayBuffer(), password);
      const url = URL.createObjectURL(new Blob([data], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.enc$/, "") + ".json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("الباسورد غلط أو الملف مش ملف نسخة احتياطية.");
    }
    setBusy(false);
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <h3>فتح نسخة من الإيميل</h3>
      <p className="muted small">
        اختار الملف اللي جالك على الإيميل (آخره .enc) واكتب باسورد النسخ الاحتياطية. الملف بيتفتح على جهازك بس، ومش بيترفع
        على أي حتة.
      </p>
      <label>
        الملف
        <input name="file" type="file" accept=".enc" required />
      </label>
      <label>
        باسورد النسخ الاحتياطية
        <input name="password" type="password" required dir="ltr" autoComplete="off" />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="btn btn-outline btn-block" type="submit" disabled={busy}>
        {busy ? "بيتفتح..." : "افتح الملف"}
      </button>
    </form>
  );
}
