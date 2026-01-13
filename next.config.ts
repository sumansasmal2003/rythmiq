import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allow images from any domain (e.g. Unsplash, Cloudinary)
      },
    ],
  },
};

export default nextConfig;
