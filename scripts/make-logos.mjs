// Makes the web logos in public/ from the original logo file (white background, big):
//   public/logo.png        the logo in its colors on a transparent background (header)
//   public/logo-white.png  all white, for the dark footer
// Run: npm run logos  (the original stays on the PC; it isn't in git)
import { existsSync } from "node:fs";
import sharp from "sharp";

const SOURCE = ["Mackine Logo.png", "originals/Mackine Logo.png"].find((f) => existsSync(f));
if (!SOURCE) throw new Error('Put "Mackine Logo.png" in the project folder first.');

const WIDTH = 360; // shown at 180px wide, sharp on phones

// Crop the white margins, then shrink.
const { data, info } = await sharp(SOURCE)
  .trim({ threshold: 20 })
  .resize({ width: WIDTH })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

// White background -> transparent: how dark a pixel is becomes how opaque it is, and the
// color is un-mixed from the white so soft edges keep the logo's own color.
const color = Buffer.alloc(info.width * info.height * 4);
const white = Buffer.alloc(info.width * info.height * 4);
for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
  const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
  const a = Math.min(1, ((255 - Math.min(r, g, b)) / 255) * 1.15);
  const unmix = (v) => (a < 0.02 ? 0 : Math.max(0, Math.min(255, Math.round((v - 255 * (1 - a)) / a))));
  color[j] = unmix(r);
  color[j + 1] = unmix(g);
  color[j + 2] = unmix(b);
  color[j + 3] = Math.round(a * 255);
  white[j] = white[j + 1] = white[j + 2] = 255;
  white[j + 3] = Math.round(a * 255);
}

const raw = { raw: { width: info.width, height: info.height, channels: 4 } };
await sharp(color, raw).png({ compressionLevel: 9, palette: true }).toFile("public/logo.png");
await sharp(white, raw).png({ compressionLevel: 9, palette: true }).toFile("public/logo-white.png");
console.log(`logos: ${info.width}x${info.height} from ${SOURCE}`);
