import adapter from "@sveltejs/adapter-static";
import { isAbsolute } from "node:path";
import { loadEnv } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { svelteTesting } from "@testing-library/svelte/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

const mode = process.env.NODE_ENV === "production" ? "production" : "development";
const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };

function normalizeBasePath(value: string | undefined): "" | `/${string}` {
  const basePath = (value ?? "").trim();
  if (!basePath || basePath === "/") return "";
  if (!basePath.startsWith("/")) {
    throw new Error("VITE_BASE_PATH må være tom eller starte med /.");
  }
  return basePath.replace(/\/+$/, "") as `/${string}`;
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

function resolveStaticOutputDirectory() {
  const configured = env.BANEBOOKING_STATIC_OUTPUT_DIR?.trim();
  if (!configured) return "dist";
  const segments = configured.split(/[\\/]/);
  if (
    isAbsolute(configured) ||
    /^[a-z]:[\\/]/i.test(configured) ||
    segments.some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw new Error(
      "BANEBOOKING_STATIC_OUTPUT_DIR må være en normalisert, relativ undermappe i frontend-repoet."
    );
  }
  return configured;
}

const staticHost = resolveStaticHost();
const staticOutputDirectory = resolveStaticOutputDirectory();

const apiProxy = {
  "/api": {
    target: process.env.BANEBOOKING_API_PROXY_TARGET ?? "http://localhost:5015",
    changeOrigin: true,
    secure: false,
  },
};

export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter({
        pages: staticOutputDirectory,
        assets: staticOutputDirectory,
        fallback: staticHost === "github-pages" ? "404.html" : "index.html",
        precompress: false,
        strict: true,
      }),
      paths: { base: normalizeBasePath(env.VITE_BASE_PATH), relative: false },
      files: { assets: "public" },
      version: { pollInterval: 0 },
    }),
    tailwindcss(),
    svelteTesting(),
  ],
  build: {
    target: "es2022",
    sourcemap: false,
    modulePreload: { polyfill: false },
    cssCodeSplit: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [{ name: "rich-text-engine", test: /node_modules[\\/]prosemirror-/ }],
        },
      },
    },
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
    include: ["src/**/*.{test,spec}.ts"],
  },
});
