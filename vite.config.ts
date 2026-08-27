import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    // Path alias for shadcn (@ -> src)
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    // Vite options tailored for Tauri development and network preview
    clearScreen: false,
    server: {
      port: 1420,
      strictPort: true,
      // Expose server to network (0.0.0.0) if TAURI_DEV_HOST is not explicitly set
      host: host || "0.0.0.0",
      hmr: host
        ? {
            protocol: "ws",
            host,
            port: 1421,
          }
        : undefined,
      watch: {
        // Tell Vite to ignore watching `src-tauri`
        ignored: ["**/src-tauri/**"],
      },
      // Only relevant for browser-tab dev preview (`npm run dev` opened in Chrome):
      // relays /api/* server-to-server so the browser never makes a cross-origin
      // request directly, sidestepping CORS. The packaged Tauri app never uses this
      // proxy — it calls VITE_API_BASE_URL directly via plugin-http (see src/lib/api/client.ts),
      // which isn't subject to browser CORS at all.
      proxy: env.VITE_API_BASE_URL
        ? {
            "/api": {
              target: env.VITE_API_BASE_URL,
              changeOrigin: true,
              secure: true,
            },
          }
        : undefined,
    },
  };
});