import type { NextConfig } from "next";

// Baseline browser protections, applied to every response.
const securityHeaders = [
  // Don't let other sites frame SniffNotes (clickjacking), and keep forms and plugins on this site.
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  // Browsers must use the declared content type instead of guessing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send only the origin (not full URLs with search terms) to other sites.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The site doesn't use these browser features, so nothing embedded on it can either.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  // HTTPS only, for two years (ignored over plain http, so local development is unaffected).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework in an X-Powered-By header.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
