import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.dropbox.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.bigcartel.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lwghbcpyhssfgncrgzbt.supabase.co',
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;
