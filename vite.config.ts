import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,

    // 👇 NEW: Proxy setup for backend
    proxy: {
      "/bots": {
        target: "http://127.0.0.1:8000", // FastAPI server URL
        changeOrigin: true,
      },
      "/chat": {
        target: "http://127.0.0.1:8000", // FastAPI server URL
        changeOrigin: true,
      },
    },
  },

  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
