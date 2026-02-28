import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// Plugin som erstatter %BASE_URL% i index.html med riktig base-path
function htmlBaseUrlPlugin(base: string): Plugin {
  return {
    name: "html-base-url",
    enforce: "pre",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        return html.replace(/%BASE_URL%/g, base);
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  // GH Pages prod ligger under /banebooking-voyager-fe/
  // Dev/preview lokalt skal være /
  const base = mode === "production" ? "/banebooking-voyager-fe/" : "/";

  return {
    base,

    plugins: [react(), tailwindcss(), htmlBaseUrlPlugin(base)],

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
  };
});
