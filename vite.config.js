import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Custom plugin to inject environment variables into HTML
function htmlEnvPlugin() {
  return {
    name: 'html-env',
    transformIndexHtml: {
      order: 'pre',
      handler(html, { server }) {
        // Get environment variables
        const mode = server?.config.mode || 'production';
        const env = loadEnv(mode, process.cwd(), '');
        
        // Replace placeholders in HTML
        return html.replace(/%(\w+)%/g, (match, key) => {
          return env[key] || '';
        });
      },
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), htmlEnvPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          motion: ["framer-motion"],
          ui: ["lucide-react", "styled-components"],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
