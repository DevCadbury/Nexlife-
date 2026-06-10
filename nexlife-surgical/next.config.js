/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  // Pin Turbopack's root to this project so it resolves node_modules here,
  // not the parent monorepo folder (which has its own package.json/lockfile).
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

module.exports = nextConfig;
