import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => ({
  // GH Pages prod ligger under /banebooking-voyager-fe/
  // Dev/preview lokalt skal være /
  base: mode === "production" ? "/banebooking-voyager-fe/" : "/",

  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/")) {
            return "react";
          }
          if (id.includes("node_modules/@radix-ui")) {
            return "shadcn";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "lucide";
          }
        },
      },
    },
  },

  server: {
    // Vite dev server: åpne riktig startside (uten /banebooking-voyager-fe/)
    open: "/aas-tennisklubb",
    proxy: {
      "/api": {
        target: "http://localhost:5015",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  preview: {
    // vite preview kjører også "lokalt", så start på /
    open: "/aas-tennisklubb",
    proxy: {
      "/api": {
        target: "http://localhost:5015",
        changeOrigin: true,
        secure: false,
      },
    },
  },
}));
