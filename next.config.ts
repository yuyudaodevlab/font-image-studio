import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: isProd ? basePath : "",
  assetPrefix: isProd ? (basePath ? `${basePath}/` : undefined) : undefined,
  trailingSlash: true,
};

export default nextConfig;
