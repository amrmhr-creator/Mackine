import { SITE } from "@/lib/site";

/** The bearing seen from the front: two rings, eight balls, one of them red. Draws in the text color. */
export function LogoMark({ size }: { size?: number }) {
  const balls = [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const a = (i * Math.PI) / 4;
    return <circle key={i} cx={50 + 32 * Math.cos(a)} cy={50 + 32 * Math.sin(a)} r="6" />;
  });
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" className="logo-mark">
      <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="6" />
      <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="6" />
      <g fill="currentColor">{balls}</g>
      <circle cx="72.63" cy="27.37" r="6" fill="#c5252b" />
    </svg>
  );
}

/** The mark with MACKINE and مكين next to it, in the site's display font. */
export default function Logo() {
  return (
    <span className="logo" role="img" aria-label={`${SITE.name} ${SITE.nameEn}`}>
      <LogoMark />
      <span className="logo-words" aria-hidden="true">
        <span className="logo-en" dir="ltr">
          MACKINE
        </span>
        <span className="logo-ar">{SITE.name}</span>
      </span>
    </span>
  );
}
