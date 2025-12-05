import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-expect-error turbo is a valid option in newer Next.js versions
  turbo: {
    rules: {
      "**/*.md": ["raw-loader"],
      "**/LICENSE": ["raw-loader"],
      "**/*.sh": ["raw-loader"],
      "**/node_modules/thread-stream/**/*.ts": ["raw-loader"],
    }
  },
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
