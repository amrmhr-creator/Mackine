// Brands Mackine can supply. The admin panel saves its own copy (lib/catalog-data.ts).
// The starting list is the well-known names in the market, all HIDDEN: a brand shows on the
// site only after the owner confirms Mackine really supplies it (ticks "ظاهر" in the panel).

export type Brand = {
  id: string;
  name: string;
  /** Category slugs this brand belongs to (it's listed on those category pages). */
  categories: string[];
  /** Uploaded logo (/uploads/…) or "" for the name in text. */
  logo: string;
  visible: boolean;
};

const b = (name: string, categories: string[]): Brand => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name,
  categories,
  logo: "",
  visible: false,
});

const BEARINGS = ["bearings", "bearing-units"];

export const DEFAULT_BRANDS: Brand[] = [
  b("SKF", BEARINGS),
  b("FAG", BEARINGS),
  b("NSK", BEARINGS),
  b("NTN", BEARINGS),
  b("TIMKEN", BEARINGS),
  b("KOYO", BEARINGS),
  b("ZWZ", BEARINGS),
  b("HTB", ["bearings", "linear-motion"]),
  b("HIWIN", ["linear-motion", "ball-screws"]),
  b("THK", ["linear-motion", "ball-screws"]),
  b("PMI", ["linear-motion", "ball-screws"]),
  b("GATES", ["belts"]),
  b("OPTIBELT", ["belts"]),
  b("CONTITECH", ["belts"]),
  b("BANDO", ["belts"]),
  b("TSUBAKI", ["power-transmission"]),
  b("REGINA", ["power-transmission"]),
];
