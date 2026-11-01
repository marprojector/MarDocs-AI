import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ngz5i9qy.vercel.app',
      },
    ],
  },
};

export default nextConfig;
