import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The shared workspace packages ship TypeScript source.
  transpilePackages: ["@skedgelife/data", "@skedgelife/skins", "@skedgelife/types", "@skedgelife/ui"],
};

export default nextConfig;
