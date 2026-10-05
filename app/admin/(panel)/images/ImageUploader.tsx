"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Uploads the chosen photos one by one, then refreshes the list. */
export default function ImageUploader() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const files = (form.elements.namedItem("files") as HTMLInputElement).files;
    const alt = (form.elements.namedItem("alt") as HTMLInputElement).value;
    if (!files || files.length === 0) return;

    setBusy(true);
    setErrors([]);
    const failed: string[] = [];
    let done = 0;
    for (const file of Array.from(files)) {
      setMessage(`بيترفع ${done + 1} من ${files.length}...`);
      const body = new FormData();
      body.append("file", file);
      body.append("alt", alt);
      try {
        const res = await fetch("/admin/api/images", { method: "POST", body });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || "حصلت مشكلة، جرّب تاني.");
        done++;
      } catch (err) {
        failed.push(`${file.name}: ${err instanceof Error ? err.message : "حصلت مشكلة"}`);
      }
    }
    setBusy(false);
    setErrors(failed);
    setMessage(done > 0 ? `✓ اترفع ${done} صورة.` : "");
    form.reset();
    router.refresh();
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <h3>رفع صور جديدة</h3>
      <label>
        الصور (ممكن تختار أكتر من صورة)
        <input name="files" type="file" accept="image/jpeg,image/png,image/webp" multiple required />
      </label>
      <label>
        وصف الصورة (بيظهر للي مش شايف الصورة ولجوجل، مثلاً: &quot;رولمان بلي SKF 6205&quot;)
        <input name="alt" maxLength={150} />
      </label>
      <p className="muted small">الصورة بتتصغّر وتتضغط لوحدها، فارفعها زي ما هي من الموبايل.</p>
      {errors.map((e) => (
        <p key={e} className="form-error" role="alert">
          {e}
        </p>
      ))}
      {message && <p role="status">{message}</p>}
      <button className="btn btn-red btn-block" type="submit" disabled={busy}>
        {busy ? "بيترفع..." : "ارفع"}
      </button>
    </form>
  );
}
