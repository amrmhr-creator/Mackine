import Link from "next/link";
import { categoryHref, type Category } from "@/lib/categories";
import CategoryIcon from "./CategoryIcon";

export default function CategoryCard({ c }: { c: Category }) {
  return (
    <Link href={categoryHref(c)} className="cat">
      {c.image ? (
        // Uploaded photos are already resized and compressed.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={c.image} alt="" className="cat-photo" loading="lazy" />
      ) : (
        <CategoryIcon name={c.icon} />
      )}
      <h3>{c.name}</h3>
      <p>{c.short}</p>
      {c.codes.length > 0 && <div className="codes ltr">{c.codes.slice(0, 5).join(" · ")}</div>}
      <span className="more">التفاصيل ←</span>
    </Link>
  );
}
