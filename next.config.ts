import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
