import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Performance: Optimize resource loading and source maps
  productionBrowserSourceMaps: false,
  
  // Experimental: Stabilize Turbopack & Enable Server Source Maps
  experimental: {
    serverSourceMaps: true,
  },

  // Explicitly signal Turbopack usage to resolve config conflicts
  turbopack: {},

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'sgp.cloud.appwrite.io',
        pathname: '**',
      },
      {
          protocol: 'https',
          hostname: 'cloud.appwrite.io',
          pathname: '**',
      }
    ],
  },
};

export default nextConfig;
