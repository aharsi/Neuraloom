import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://www.shutterstock.com/**")],
  },
};

export default nextConfig;
