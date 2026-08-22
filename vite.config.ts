import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

const apiProxy = {
  "/api": {
    target: "http://localhost:5015",
    changeOrigin: true,
    secure: false,
  },
};

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],
  build: {
    target: "es2022",
    sourcemap: false,
    modulePreload: { polyfill: false },
    cssCodeSplit: true,
  },
  server: {
    open: false,
    proxy: apiProxy,
  },
  preview: {
    open: false,
    proxy: apiProxy,
  },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
