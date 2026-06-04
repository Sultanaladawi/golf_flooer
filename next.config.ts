import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'kindly-scalping-hypnosis.ngrok-free.dev',
    'localhost:3000'
  ],
  devIndicators: false
};

export default nextConfig;
