import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// AI search crawlers we want to read the site once it launches.
const AI_BOTS = ["GPTBot", "OAI-SearchBot", "Google-Extended", "PerplexityBot", "ClaudeBot"];

export default function robots(): MetadataRoute.Robots {
  // Pre-launch: keep every crawler out. The switch is ALLOW_INDEXING in next.config.mjs.
  if (process.env.ALLOW_INDEXING !== "true") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/wa"] },
      { userAgent: AI_BOTS, allow: "/", disallow: ["/api/", "/admin", "/wa"] },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
