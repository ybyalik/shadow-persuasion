import type { NextConfig } from "next";

// Defensive: strip stray trailing whitespace or a literal "\n" from env values.
// A copy-paste typo in a Vercel env var (e.g. NEXT_PUBLIC_SUPABASE_URL ending
// in "\n") otherwise crashes the build when a client is constructed from it.
// NEXT_PUBLIC_* values are inlined at build time, so cleaning them here fixes
// both client and server usage.
for (const key of Object.keys(process.env)) {
  const val = process.env[key];
  if (typeof val === "string") {
    const cleaned = val.replace(/\\n+$/g, "").replace(/\s+$/g, "");
    if (cleaned !== val) process.env[key] = cleaned;
  }
}

const nextConfig: NextConfig = {
  // Type errors now fail the build (source is type-clean), so broken types
  // can't silently ship to production.
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  async headers() {
    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      {
        // Allow the site's own pages to use the microphone (Live Sparring
        // voice practice). Camera and geolocation stay disabled (unused).
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(self), geolocation=()',
      },
    ];
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
