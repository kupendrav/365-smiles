import type { NextConfig } from "next";

const nextConfig = {
  // Avoid OneDrive file locks on .next by using a custom distDir
  distDir: '.next-dev',
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
