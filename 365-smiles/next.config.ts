import type { NextConfig } from 'next';

// Use default `.next` on CI/Vercel. Keep `.next-dev` only for local builds
const isCI = !!process.env.CI;
const isVercel = !!process.env.VERCEL;
const useCustomDist = !(isCI || isVercel);

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : 'ywkyzrnosfkxzzvotygn.supabase.co';

const nextConfig: NextConfig = {
  ...(useCustomDist ? { distDir: '.next-dev' } : {}),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHostname,
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
