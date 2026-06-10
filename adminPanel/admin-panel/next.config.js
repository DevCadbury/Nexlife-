/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Pin Turbopack's root to this project so it resolves node_modules here,
  // not the parent monorepo folder (which has its own package.json/lockfile).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

module.exports = nextConfig;
