import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const builds = [
  {
    basePath: "",
    directory: ".e2e-build/root",
    fallback: "index.html",
    host: "Cloudflare Pages",
  },
  {
    basePath: "/banebooking",
    directory: ".e2e-build/base",
    fallback: "404.html",
    host: "GitHub Pages",
  },
];

const relevantLazyChunkMarkers = [
  { label: "Sentry", marker: "sentry_key" },
  { label: "Supabase", marker: "supabase-js-" },
  { label: "Rich text editor", marker: "ProseMirror" },
];

export async function measureProductionBuilds(projectRoot) {
  const measurements = [];
  for (const build of builds) measurements.push(await measureBuild(projectRoot, build));
  return measurements;
}

async function measureBuild(projectRoot, build) {
  const buildDirectory = path.join(projectRoot, build.directory);
  const fallbackHtml = await readFile(path.join(buildDirectory, build.fallback), "utf8");
  const startupReferences = readStartupReferences(fallbackHtml);
  const startupAssets = await Promise.all(
    startupReferences.map(async (reference) => {
      const absolutePath = buildFile(buildDirectory, build.basePath, reference);
      return measureAsset(buildDirectory, absolutePath);
    })
  );
  const javaScriptFiles = (await collectFiles(path.join(buildDirectory, "_app/immutable"))).filter(
    (file) => file.endsWith(".js")
  );
  const startupJavaScriptFiles = new Set(
    startupAssets.filter(({ asset }) => asset.endsWith(".js")).map(({ asset }) => asset)
  );
  const javaScriptSources = new Map(
    await Promise.all(
      javaScriptFiles.map(async (absolutePath) => [
        repositoryPath(buildDirectory, absolutePath),
        await readFile(absolutePath, "utf8"),
      ])
    )
  );
  const lazyJavaScriptAssets = await Promise.all(
    javaScriptFiles
      .filter(
        (absolutePath) => !startupJavaScriptFiles.has(repositoryPath(buildDirectory, absolutePath))
      )
      .map((absolutePath) => measureAsset(buildDirectory, absolutePath))
  );
  lazyJavaScriptAssets.sort((left, right) => compareStrings(left.asset, right.asset));
  const largestLazyJavaScript = [...lazyJavaScriptAssets].sort(
    (left, right) => right.gzipBytes - left.gzipBytes || compareStrings(left.asset, right.asset)
  )[0];

  const relevantLazyChunks = relevantLazyChunkMarkers.map(({ label, marker }) => {
    const matchingAssets = lazyJavaScriptAssets.filter(({ asset }) =>
      javaScriptSources.get(asset)?.includes(marker)
    );
    if (matchingAssets.length === 0) {
      throw new Error(`${build.host}: fant ikke lazy chunk for ${label}.`);
    }
    return { assets: matchingAssets, label };
  });
  const initialCssAssets = startupAssets
    .filter(({ asset }) => asset.endsWith(".css"))
    .sort((left, right) => compareStrings(left.asset, right.asset));
  const initialJavaScriptAssets = startupAssets
    .filter(({ asset }) => asset.endsWith(".js"))
    .sort((left, right) => compareStrings(left.asset, right.asset));

  return {
    basePath: build.basePath || "/",
    host: build.host,
    initialCssAssets,
    initialCssGzipBytes: sumGzipBytes(initialCssAssets),
    initialJavaScriptAssets,
    initialJavaScriptGzipBytes: sumGzipBytes(initialJavaScriptAssets),
    javaScriptChunkCount: javaScriptFiles.length,
    largestLazyJavaScript,
    relevantLazyChunks,
  };
}

function readStartupReferences(html) {
  const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((reference) => /\.(?:css|js)$/.test(reference));
  return [...new Set(references)].sort(compareStrings);
}

function buildFile(buildDirectory, basePath, reference) {
  const pathname = new URL(reference, "https://banebooking.test").pathname;
  const relativePath = basePath ? pathname.slice(basePath.length) : pathname;
  return path.join(buildDirectory, relativePath.replace(/^\/+/, ""));
}

async function measureAsset(buildDirectory, absolutePath) {
  const content = await readFile(absolutePath);
  return {
    asset: repositoryPath(buildDirectory, absolutePath),
    gzipBytes: gzipSync(content).byteLength,
    rawBytes: content.byteLength,
  };
}

async function collectFiles(directory) {
  const entries = (await readdir(directory, { withFileTypes: true })).sort((left, right) =>
    compareStrings(left.name, right.name)
  );
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(entryPath)));
    if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

function repositoryPath(root, absolutePath) {
  return path.relative(root, absolutePath).split(path.sep).join("/");
}

function sumGzipBytes(assets) {
  return assets.reduce((total, { gzipBytes }) => total + gzipBytes, 0);
}

function compareStrings(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}
