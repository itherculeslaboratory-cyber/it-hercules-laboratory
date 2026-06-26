import type { NextConfig } from "next";

const normalizeApiBase = (raw: string): string => {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (trimmed.endsWith("/api")) {
    return trimmed.slice(0, -4);
  }
  return trimmed;
};

const nextConfig: NextConfig = {
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
