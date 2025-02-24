import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // This disables ESLint during builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
