import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "tgggyddsxolatgthrrgv.supabase.co",
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "react-icons",
      "gsap",
      "three",
      "lucide-react",
    ],
  },
};

export default nextConfig;
