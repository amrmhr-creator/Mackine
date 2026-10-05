import type { IconName } from "@/lib/categories";

const PATHS: Record<IconName, React.ReactNode> = {
  bearing: (
    <>
      <circle cx="20" cy="20" r="16" />
      <circle cx="20" cy="20" r="7" />
      <circle cx="20" cy="8.5" r="2.2" fill="currentColor" />
      <circle cx="31.5" cy="20" r="2.2" fill="currentColor" />
      <circle cx="20" cy="31.5" r="2.2" fill="currentColor" />
      <circle cx="8.5" cy="20" r="2.2" fill="currentColor" />
    </>
  ),
  unit: (
    <>
      <path d="M6 33h28M9 33V24a11 11 0 0 1 22 0v9" />
      <circle cx="20" cy="22" r="5" />
      <path d="M4 33v3h32v-3" />
    </>
  ),
  linear: (
    <>
      <path d="M3 27h34M3 31h34" />
      <rect x="12" y="14" width="16" height="11" rx="2" />
      <path d="M16 19h8" />
    </>
  ),
  screw: (
    <>
      <path d="M3 20h34" />
      <path d="M7 14l3 12M12 14l3 12M17 14l3 12M22 14l3 12M27 14l3 12" />
      <rect x="15" y="11" width="10" height="18" rx="2" />
    </>
  ),
  bushing: (
    <>
      <ellipse cx="20" cy="10" rx="11" ry="4" />
      <path d="M9 10v20c0 2.2 4.9 4 11 4s11-1.8 11-4V10" />
      <ellipse cx="20" cy="10" rx="5" ry="1.8" />
    </>
  ),
  belt: (
    <>
      <rect x="3" y="11" width="34" height="18" rx="9" />
      <circle cx="12" cy="20" r="4" />
      <circle cx="28" cy="20" r="4" />
    </>
  ),
  chain: (
    <>
      <circle cx="20" cy="20" r="9" />
      <circle cx="20" cy="20" r="3" />
      <path d="M20 4v5M20 31v5M4 20h5M31 20h5M8.7 8.7l3.5 3.5M27.8 27.8l3.5 3.5M31.3 8.7l-3.5 3.5M12.2 27.8l-3.5 3.5" />
    </>
  ),
  seal: (
    <>
      <circle cx="20" cy="20" r="15" />
      <circle cx="20" cy="20" r="9" />
      <path d="M20 5v6M20 29v6" strokeDasharray="2 2" />
    </>
  ),
  wrench: <path d="M8 32 24 16M22 7a7 7 0 0 0 9.5 9.5l-3.6-.9-1.8-1.8-.9-3.6z" strokeLinejoin="round" />,
};

export default function CategoryIcon({ name, size = 40 }: { name: IconName; size?: number }) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      aria-hidden="true"
      className="cat-icon"
    >
      {PATHS[name] ?? PATHS.wrench}
    </svg>
  );
}
