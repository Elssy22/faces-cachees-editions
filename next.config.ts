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
      {
        protocol: 'https',
        hostname: 'www.startnplay.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.booska-p.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.bissai.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'yt3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
