import adapter from "@sveltejs/adapter-static";
import { loadEnv } from "vite";

const mode = process.env.NODE_ENV === "production" ? "production" : "development";
const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };

function normalizeBasePath(value) {
  const basePath = (value ?? "").trim();
  if (!basePath || basePath === "/") return "";
  if (!basePath.startsWith("/")) {
    throw new Error("VITE_BASE_PATH må være tom eller starte med /.");
  }
  return basePath.replace(/\/+$/, "");
}

function resolveStaticHost() {
  const configured = env.VITE_STATIC_HOST?.trim();
  if (configured === "github-pages" || configured === "cloudflare-pages") return configured;
  if (configured) {
    throw new Error("VITE_STATIC_HOST må være github-pages eller cloudflare-pages.");
  }
  if (env.GITHUB_ACTIONS === "true") return "github-pages";
  return "cloudflare-pages";
}

const staticHost = resolveStaticHost();

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: "dist",
      assets: "dist",
      fallback: staticHost === "github-pages" ? "404.html" : "index.html",
      precompress: false,
      strict: true,
    }),
    alias: {
      "@": "./src",
    },
    paths: {
      base: normalizeBasePath(env.VITE_BASE_PATH),
      relative: false,
    },
    files: {
      assets: "public",
    },
  },
};

export default config;
