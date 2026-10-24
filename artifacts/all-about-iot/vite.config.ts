import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Sensible local defaults keep the frontend runnable on a fresh checkout.
// Override these with environment variables when deploying.
const rawPort = process.env.VITE_PORT ?? "5173";
const port = Number(rawPort);

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error(`Invalid VITE_PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";
const host =
  process.env.VITE_HOST ?? (process.env.REPL_ID ? "0.0.0.0" : "127.0.0.1");
const allowedHosts = process.env.REPLIT_DOMAINS?.split(",")
  .map((domain) => domain.trim())
  .filter(Boolean);

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(
        import.meta.dirname,
        "..",
        "..",
        "attached_assets",
      ),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host,
    // Keep frontend requests to /api working while the API runs separately.
    proxy: {
      "/api": {
        target: process.env.API_PROXY_TARGET ?? "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
    ...(allowedHosts ? { allowedHosts } : {}),
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host,
    ...(allowedHosts ? { allowedHosts } : {}),
  },
});
