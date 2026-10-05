"use client";

import { useState } from "react";

type Pair = { title: string; text: string };

/** Rows of "title + text" (category types, questions) that can be added, removed and reordered. */
export default function PairsEditor({
  titleName,
  textName,
  titleLabel,
  textLabel,
  addLabel,
  initial,
}: {
  titleName: string;
  textName: string;
  titleLabel: string;
  textLabel: string;
  addLabel: string;
  initial: Pair[];
}) {
  // Each row keeps a stable key so typing isn't lost when rows move.
  const [rows, setRows] = useState(() => initial.map((p, i) => ({ ...p, key: i })));
  const [nextKey, setNextKey] = useState(initial.length);

  const update = (key: number, field: keyof Pair, value: string) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  const move = (i: number, dir: -1 | 1) =>
    setRows((rs) => {
      const j = i + dir;
      if (j < 0 || j >= rs.length) return rs;
      const copy = rs.slice();
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  return (
    <div className="pairs">
      {rows.map((r, i) => (
        <div key={r.key} className="pair">
          <label>
            {titleLabel}
            <input name={titleName} value={r.title} maxLength={200} onChange={(e) => update(r.key, "title", e.target.value)} />
          </label>
          <label>
            {textLabel}
            <textarea name={textName} value={r.text} maxLength={1500} rows={2} onChange={(e) => update(r.key, "text", e.target.value)} />
          </label>
          <div className="admin-row-actions">
            <button type="button" className="btn btn-sm btn-outline" onClick={() => move(i, -1)} disabled={i === 0} aria-label="طلّعه">
              ↑
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => move(i, 1)}
              disabled={i === rows.length - 1}
              aria-label="نزّله"
            >
              ↓
            </button>
            <button type="button" className="btn btn-sm btn-outline admin-delete" onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}>
              شيل
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-sm btn-outline"
        onClick={() => {
          setRows((rs) => [...rs, { title: "", text: "", key: nextKey }]);
          setNextKey((k) => k + 1);
        }}
      >
        {addLabel}
      </button>
    </div>
  );
}
