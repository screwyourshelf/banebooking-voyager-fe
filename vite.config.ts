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

      rolldownOptions: {
        output: {
          // Unike URL-er for hele modulgrafen hindrer at nettleseren blander
          // JavaScript fra forskjellige produksjonsdeployeringer.
          entryFileNames: `assets/[name]-${releaseId}-[hash].js`,
          chunkFileNames: `assets/[name]-${releaseId}-[hash].js`,

          codeSplitting: {
            groups: [
              {
                name: "react",
                test: /node_modules[\\/](?:react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
                priority: 100,
              },
              {
                name: "editor",
                test: /node_modules[\\/](?:@tiptap[\\/]|prosemirror-[^\\/]+[\\/]|orderedmap[\\/]|w3c-keyname[\\/])/,
                priority: 90,
              },
              {
                name: "radix",
                test: /node_modules[\\/](?:@radix-ui[\\/]|radix-ui[\\/]|@floating-ui[\\/]|react-remove-scroll(?:-bar)?[\\/]|react-style-singleton[\\/]|aria-hidden[\\/]|use-callback-ref[\\/]|use-sidecar[\\/])/,
                priority: 80,
              },
              {
                name: "query",
                test: /node_modules[\\/]@tanstack[\\/]/,
                priority: 70,
              },
              {
                name: "supabase",
                test: /node_modules[\\/]@supabase[\\/]/,
                priority: 70,
              },
              {
                name: "forms",
                test: /node_modules[\\/](?:react-hook-form[\\/]|@hookform[\\/]|zod[\\/])/,
                priority: 70,
              },
              {
                name: "date",
                test: /node_modules[\\/]date-fns[\\/]/,
                priority: 70,
              },
              {
                name: "icons",
                test: /node_modules[\\/]lucide-react[\\/]/,
                priority: 70,
              },
            ],
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
