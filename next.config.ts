import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-expect-error turbo is a valid option in newer Next.js versions
  turbo: {
    rules: {
      "*.md": ["raw-loader"],
      "*.LICENSE": ["raw-loader"],
      "*.sh": ["raw-loader"],
      "**/node_modules/thread-stream/**/*.ts": ["raw-loader"],
    }
  }
};

export default nextConfig;
