import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  productionBrowserSourceMaps: false,
  compiler:
    process.env.NODE_ENV === "production"
      ? { removeConsole: { exclude: ["error"] } }
      : undefined,
  modularizeImports: {
    antd: {
      transform: "antd/es/{{member}}",
      preventFullImport: true,
    },
    "@ant-design/icons": {
      transform: "@ant-design/icons/es/icons/{{member}}",
      preventFullImport: true,
    },
  },
  experimental: {
    optimizePackageImports: ["antd", "@ant-design/icons"],
  },
};

export default nextConfig;
