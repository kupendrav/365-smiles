import type { NextConfig } from "next";

// Use default `.next` on CI/Vercel. Keep `.next-dev` only for local builds
const isCI = !!process.env.CI;
const isVercel = !!process.env.VERCEL;
const useCustomDist = !(isCI || isVercel);

const nextConfig: NextConfig = {
  ...(useCustomDist ? { distDir: ".next-dev" } : {}),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ywkyzrnosfkxzzvotygn.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = nextConfig;
