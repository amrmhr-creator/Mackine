// Keep search engines out until the official launch. Flip to true on launch day.
// This is the only switch: it sets the X-Robots-Tag header here, the robots meta tag
// in app/layout.tsx and app/robots.ts (via the inlined ALLOW_INDEXING env value).
const ALLOW_INDEXING = false;

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Hostinger's server has an older GLIBC; skip runtime image optimization (sharp).
  // Images in /public are already resized and compressed (npm run logos).
  images: { unoptimized: true },
  env: { ALLOW_INDEXING: String(ALLOW_INDEXING) },
  async headers() {
    // Basic browser protections on every page.
    const security = [
      { key: "Strict-Transport-Security", value: "max-age=31536000" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), usb=()" },
    ];
    const robots = ALLOW_INDEXING ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [{ source: "/:path*", headers: [...security, ...robots] }];
  },
};

export default nextConfig;
