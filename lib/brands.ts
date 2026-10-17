// Brands Mackine can supply. The admin panel saves its own copy (lib/catalog-data.ts).
// A brand shows on the site only once the owner confirms Mackine supplies it. The first group
// below is confirmed; the rest stay hidden until ticked "ظاهر" in the panel.

export type Brand = {
  id: string;
  name: string;
  /** Category slugs this brand belongs to (it's listed on those category pages). */
  categories: string[];
  /** Uploaded logo (/uploads/…) or "" for the name in text. */
  logo: string;
  visible: boolean;
};

const b = (name: string, categories: string[], visible = false): Brand => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name,
  categories,
  logo: "",
  visible,
});

const BEARINGS = ["bearings"];
const SHOWN = true; // Confirmed by the owner on 17 Oct 2026 ("انشرها كلها وبعدين نشيل الزيادة").

export const DEFAULT_BRANDS: Brand[] = [
  b("SKF", BEARINGS, SHOWN),
  b("FAG", BEARINGS, SHOWN),
  b("NSK", BEARINGS, SHOWN),
  b("NTN", BEARINGS, SHOWN),
  b("TIMKEN", BEARINGS, SHOWN),
  b("KOYO", BEARINGS, SHOWN),
  b("NACHI", BEARINGS, SHOWN),
  b("IKO", ["bearings", "linear-motion"], SHOWN),
  b("HIWIN", ["linear-motion"], SHOWN),
  b("STC-STEYR", BEARINGS, SHOWN),
  b("SM", BEARINGS, SHOWN),
  b("MTK", BEARINGS, SHOWN),
  b("ONEX", ["seals-lubrication"], SHOWN),
  b("MSK", ["belts"], SHOWN),
  b("OMEGA", ["belts"], SHOWN),
  b("TOTAL", ["tools"], SHOWN),
  b("CROWN", ["tools"], SHOWN),
  b("APT", ["tools"], SHOWN),
  b("LANLONG", ["tools"], SHOWN),
  b("ZWZ", BEARINGS),
  b("HTB", ["bearings", "linear-motion"]),
  b("THK", ["linear-motion"]),
  b("PMI", ["linear-motion"]),
  b("GATES", ["belts"]),
  b("OPTIBELT", ["belts"]),
  b("CONTITECH", ["belts"]),
  b("BANDO", ["belts"]),
  b("TSUBAKI", ["power-transmission"]),
  b("REGINA", ["power-transmission"]),
];
