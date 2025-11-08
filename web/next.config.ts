import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Silence Turbopack root warning caused by multiple lockfiles at user profile level
  // See https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory
  experimental: {
    turbopack: {
      root: "./",
    },
  },
};

export default nextConfig;
