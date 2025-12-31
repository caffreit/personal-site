import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
