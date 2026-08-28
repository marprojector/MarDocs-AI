import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    domains: ['ngz5i9qy.vercel.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ngz5i9qy.vercel.app',
      },
    ],
  },
};

export default nextConfig;
