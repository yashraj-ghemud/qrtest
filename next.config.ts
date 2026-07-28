import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove standalone mode - use regular Next.js server
  // output: "standalone",

  // Production optimizations
  typescript: {
    ignoreBuildErrors: false, // Enable type checking in production
  },

  reactStrictMode: true, // Enable strict mode for better error detection

  // Suppress hydration warnings caused by browser extensions (Bitwarden, etc.)
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Compression
  compress: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },
};

export default nextConfig;
