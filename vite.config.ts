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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = env.VITE_BASE_PATH ?? "/";

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
          // Innholdshash holder uendrede moduler stabile mellom deployeringer.
          // Det reduserer utdaterte lazy-ruter uten å gjenbruke endrede filer.
          entryFileNames: "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js",

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
