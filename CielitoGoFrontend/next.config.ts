import type { NextConfig } from "next";

const getBackendImagePattern = () => {
  const configured = process.env.API_BASE_URL;
  if (!configured) return [];

  try {
    const url = new URL(configured);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return [];
    return [
      {
        protocol: url.protocol.slice(0, -1) as "http" | "https",
        hostname: url.hostname,
        port: url.port,
        pathname: "/uploads/**",
      },
    ];
  } catch {
    return [];
  }
};

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  compress: true,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    minimumCacheTTL: 86400,
    remotePatterns: getBackendImagePattern(),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
