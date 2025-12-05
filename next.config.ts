import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(md|LICENSE|sh)$/,
      use: 'raw-loader',
    });
    config.module.rules.push({
      test: /\.ts$/,
      include: /node_modules\/thread-stream/,
      use: 'raw-loader',
    });
    return config;
  }
};

export default nextConfig;
