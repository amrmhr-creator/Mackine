"use client";

import Link from "next/link";
import { useState } from "react";

export type PickerImage = { url: string; thumb: string; alt: string };

/** Pick one of the uploaded photos (or none). Sends its URL in a hidden field. */
export default function ImagePicker({ name, images, initial }: { name: string; images: PickerImage[]; initial: string }) {
  const [picked, setPicked] = useState(images.some((i) => i.url === initial) ? initial : "");
  if (images.length === 0) {
    return (
      <p className="muted small">
        مفيش صور مرفوعة لسه. ارفع من صفحة <Link href="/admin/images">الصور</Link> وارجع هنا.
      </p>
    );
  }
  return (
    <div className="picker">
      <input type="hidden" name={name} value={picked} />
      <button type="button" className={`picker-none ${picked ? "" : "on"}`} onClick={() => setPicked("")}>
        من غير صورة
      </button>
      {images.map((img) => (
        <button
          key={img.url}
          type="button"
          className={picked === img.url ? "on" : ""}
          onClick={() => setPicked(img.url)}
          title={img.alt || "صورة"}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.thumb} alt={img.alt} loading="lazy" />
        </button>
      ))}
    </div>
  );
}
