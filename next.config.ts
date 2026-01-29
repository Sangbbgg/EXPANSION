import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Add allowedDevOrigins for cross-origin warning resolution
  // Replace 'http://localhost:3000' with your actual development origin if different.
  allowedDevOrigins: ['http://localhost:3000'],
};

export default nextConfig;
