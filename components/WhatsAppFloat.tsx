import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/site";
import WhatsAppIcon from "./WhatsAppIcon";

/** The round WhatsApp button fixed on every page. Hidden until a number is set in the panel. */
export default async function WhatsAppFloat() {
  const { whatsappNumber } = await getSettings();
  if (!whatsappNumber) return null;
  return (
    <a className="wa-float" href={whatsappLink()} aria-label="كلمنا واتساب">
      <WhatsAppIcon size={30} />
    </a>
  );
}
