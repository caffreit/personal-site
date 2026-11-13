import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Standalone HTML lab served as-is from public/
        source: "/labs/hlth-2026-field-notes",
        destination: "/labs/hlth-2026-field-notes/index.html",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/greek-theogeny/underground-lines",
        destination: "/transit-theogony",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
    // Optimize images for production
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
