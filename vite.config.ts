import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => ({
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
                    shadcn: [
                        "@radix-ui/react-slot",
                        "@radix-ui/react-tabs",
                        "@radix-ui/react-popover",
                    ],
                    lucide: ["lucide-react"],
                },
            },
        },
    },
    server: {
        open: mode === "production" ? "/banebooking-voyager-fe/aas-tennisklubb" : "/aas-tennisklubb",
        proxy: {
            "/api": {
                target: "http://localhost:5015",
                changeOrigin: true,
                secure: false,
            },
        },
    },
}));
