import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Strict Mode to prevent react-leaflet "Map container is already
  // initialized" error caused by React 18 Strict Mode double-invoking effects
  // in development. Has no effect in production builds.
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
