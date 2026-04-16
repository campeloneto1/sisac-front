import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    "192.168.0.21",
    "192.168.1.45",
    "10.9.8.227",
    "192.168.0.108",
  ],
};

export default nextConfig;
