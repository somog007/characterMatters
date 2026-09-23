import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/welcome',
        destination: '/welcome/index.html',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/landing',
        destination: '/welcome',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
