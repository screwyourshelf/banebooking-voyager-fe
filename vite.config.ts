import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Erstatter %BASE_URL% i index.html
function htmlBaseUrlPlugin(base: string): Plugin {
  return {
    name: "html-base-url",
    enforce: "pre",
    transformIndexHtml(html) {
      return html.replace(/%BASE_URL%/g, base);
    },
  };
}

function getReleaseId(): string {
  const commitSha = process.env.CF_PAGES_COMMIT_SHA?.trim();

  if (commitSha) {
    if (!/^[0-9a-f]{40}$/i.test(commitSha)) {
      throw new Error("CF_PAGES_COMMIT_SHA har ugyldig format.");
    }

    return commitSha.slice(0, 12).toLowerCase();
  }

  if (process.env.CF_PAGES === "1") {
    throw new Error("CF_PAGES_COMMIT_SHA mangler i Cloudflare Pages-bygget.");
  }

  return "local";
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = env.VITE_BASE_PATH ?? "/";
  const releaseId = getReleaseId();

  return {
    base,

    plugins: [htmlBaseUrlPlugin(base), react(), tailwindcss()],

    resolve: {
      tsconfigPaths: true,
    },

    build: {
      target: "es2022",
      sourcemap: false,

      modulePreload: {
        polyfill: false,
      },

      cssCodeSplit: true,

      rollupOptions: {
        output: {
          // Unike URL-er for hele modulgrafen hindrer at nettleseren blander
          // JavaScript fra forskjellige produksjonsdeployeringer.
          entryFileNames: `assets/[name]-${releaseId}-[hash].js`,
          chunkFileNames: `assets/[name]-${releaseId}-[hash].js`,

          manualChunks(id) {
            if (!id.includes("node_modules")) return;

            // React + router
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
              return "react";
            }

            // Radix / shadcn primitives
            if (id.includes("@radix-ui") || id.includes("radix-ui")) {
              return "radix";
            }

            // React Query
            if (id.includes("@tanstack")) {
              return "query";
            }

            // Supabase client
            if (id.includes("@supabase")) {
              return "supabase";
            }

            // Forms
            if (id.includes("react-hook-form") || id.includes("@hookform") || id.includes("zod")) {
              return "forms";
            }

            // Date utils
            if (id.includes("date-fns")) {
              return "date";
            }

            // Icons
            if (id.includes("lucide-react")) {
              return "icons";
            }
          },
        },
      },
    },

    server: {
      open: "/aas-tennisklubb",
      forwardConsole: true,
      proxy: {
        "/api": {
          target: "http://localhost:5015",
          changeOrigin: true,
          secure: false,
        },
      },
    },

    preview: {
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
