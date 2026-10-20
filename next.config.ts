import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Images are pre-sized in /public, so skip Vercel's image optimizer entirely
  images: { unoptimized: true },
  cacheComponents: true,
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
