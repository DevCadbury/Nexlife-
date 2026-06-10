/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Only set turbopack.root in local dev — Vercel sets outputFileTracingRoot
  // and the two cannot differ, which would cause a build warning/error.
  ...(process.env.VERCEL
    ? {}
    : {
        turbopack: {
          root: path.resolve(__dirname),
        },
      }),
};

module.exports = nextConfig;
