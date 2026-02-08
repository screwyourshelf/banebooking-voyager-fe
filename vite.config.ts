import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => ({
  // GH Pages prod ligger under /banebooking-voyager-fe/
  // Dev/preview lokalt skal v�re /
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
        manualChunks: {
          react: ["react", "react-dom"],
          shadcn: ["@radix-ui/react-slot", "@radix-ui/react-tabs", "@radix-ui/react-popover"],
          lucide: ["lucide-react"],
        },
      },
    },
  },

  server: {
    // Vite dev server: �pne riktig startside (uten /banebooking-voyager-fe/)
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
    // vite preview kj�rer ogs� "lokalt", s� start p� /
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
