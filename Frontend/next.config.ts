import type { NextConfig } from "next";

// Allow setting one or more external image hosts via env var NEXT_IMAGE_HOSTS
// Example: NEXT_IMAGE_HOSTS=bucket-production-b92e.up.railway.app,assets.example.com
const envHosts = (
  process.env.NEXT_IMAGE_HOSTS || "bucket-production-b92e.up.railway.app"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  images: {
    // keep legacy domains array for backward compatibility
    domains: envHosts,
    // add remotePatterns so we can allow only /uploads/** paths for the common upload host
    remotePatterns: envHosts.map((host) => ({
      protocol: "https",
      hostname: host,
      // do not require a port in case the URL includes or does not include it
      pathname: "/uploads/**",
    })),
  },
};

export default nextConfig;
