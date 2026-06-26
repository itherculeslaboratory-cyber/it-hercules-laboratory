import type { NextConfig } from "next";
import { normalizeApiBase, resolvePublicApiBase } from "./src/lib/api-base";

const nextConfig: NextConfig = {
  env: {
    // Bake public API origin at build time (CF Pages cannot proxy /api to external VPS).
    NEXT_PUBLIC_IHL_API_URL: resolvePublicApiBase(),
  },
  async rewrites() {
    const apiBase = normalizeApiBase(process.env.IHL_API_URL ?? "http://localhost:8000");
    return [
      {
        source: "/api/:path*",
        destination: `${apiBase}/api/:path*`,
      },
      {
        source: "/health",
        destination: `${apiBase}/health`,
      },
    ];
  },
};

export default nextConfig;
