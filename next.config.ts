import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { hostname: "amiable-herring-583.convex.cloud", protocol: "https" },
    ],
  },
};

export default nextConfig;
