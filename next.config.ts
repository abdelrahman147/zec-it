import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      loaders: [
        { test: /\.(md|txt|markdown)$/, type: 'asset/source' },
        { test: /(^|\/)LICENSE$/, type: 'asset/source' },
        { test: /\.sh$/, type: 'asset/source' },
        { test: /\.(ts|js)$/, include: /node_modules\/thread-stream/, type: 'asset/source' }
      ]
    }
  }
};

export default nextConfig;
