import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/landing',
        destination: '/landing/index.html',
      },
    ];
  },
};

export default nextConfig;
