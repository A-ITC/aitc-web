import type { NextConfig } from "next";

const root_url = process.env.ROOT_URL

const nextConfig: NextConfig = {
  /* config options here */
  basePath: root_url,

  devIndicators: {
    appIsrStatus: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aitc.eulious.com',
        pathname: '/kyoichi/**',
      },
    ],
  }
};

export default nextConfig;