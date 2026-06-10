/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  // On Vercel, outputFileTracingRoot is set automatically and must not conflict
  // with turbopack.root. We only set turbopack.root in local dev to prevent
  // the monorepo parent package.json from being picked up as the workspace root.
  ...(process.env.VERCEL
    ? {}
    : {
        turbopack: {
          root: path.resolve(__dirname),
        },
      }),
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
