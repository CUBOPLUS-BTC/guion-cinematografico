import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "defensive-arnold-ready-wedding.trycloudflare.com",
    "*.trycloudflare.com",
  ],
};

export default nextConfig;
