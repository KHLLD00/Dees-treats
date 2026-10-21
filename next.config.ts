import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Images are pre-sized in /public, so skip Vercel's image optimizer entirely
  images: { unoptimized: true },
  cacheComponents: true,
  // The site is one page now; keep old links working
  async redirects() {
    return [
      { source: "/menu", destination: "/#menu", permanent: true },
      { source: "/order", destination: "/#order", permanent: true },
      { source: "/about", destination: "/#about", permanent: true },
    ];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
