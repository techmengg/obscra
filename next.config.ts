import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  // Performance optimizations
  compress: true,

  // Configure experimental features for better performance
  experimental: {
    optimizePackageImports: [
      'cheerio',
      'jszip',
      'sanitize-html',
    ],
  },

  // Headers for better caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|webp)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
