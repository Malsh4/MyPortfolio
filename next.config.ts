import type { NextConfig } from "next";

// GitHub Pages serves project sites from /<repo-name>. The deploy workflow sets
// NEXT_PUBLIC_BASE_PATH (e.g. "/MyPortfolio"); locally it is empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
