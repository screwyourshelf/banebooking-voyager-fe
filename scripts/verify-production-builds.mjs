import { readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, normalize, relative } from "node:path";
import { gzipSync } from "node:zlib";

const budgets = {
  initialCssGzipKiB: 50,
  initialJavaScriptGzipKiB: 50,
  largestLazyJavaScriptGzipKiB: 130,
  publicBookingJavaScriptGzipKiB: 165,
};

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

const measurements = builds.map(verifyBuild);

for (const measurement of measurements) {
  console.log(
    [
      measurement.host,
      `initial JS ${formatKiB(measurement.initialJavaScriptGzipBytes)}`,
      `public booking JS ${formatKiB(measurement.publicBookingJavaScriptGzipBytes)}`,
      `initial CSS ${formatKiB(measurement.initialCssGzipBytes)}`,
      `largest lazy JS ${formatKiB(measurement.largestLazyJavaScriptGzipBytes)}`,
      `JS chunks ${measurement.javaScriptChunkCount}`,
    ].join(" | ")
  );
}

function verifyBuild(build) {
  const fallbackFile = join(build.directory, build.fallback);
  const fallbackHtml = readFileSync(fallbackFile, "utf8");
  const callbackHtml = readFileSync(join(build.directory, "auth/callback.html"), "utf8");
  const initialReferences = readStartupReferences(fallbackHtml);
  const expectedPrefix = `${build.basePath}/_app/`;

  assert(
    initialReferences.every((reference) => reference.startsWith(expectedPrefix)),
    `${build.host}: oppstartsreferanser må bruke base path ${build.basePath || "/"}.`
  );
  assert(
    callbackHtml.includes(`${build.basePath}/_app/immutable/entry/start.`),
    `${build.host}: callbackartefaktet bruker ikke forventet base path.`
  );
  assert(
    fallbackHtml.includes("<title>Banebooking</title>"),
    `${build.host}: SPA-fallbacken mangler standard dokumenttittel.`
  );

  const robots = readFileSync(join(build.directory, "robots.txt"), "utf8").trim();
  assert(
    robots === "User-agent: *\nAllow: /",
    `${build.host}: robots.txt avviker fra den offentlige crawlkontrakten.`
  );

  const llms = readFileSync(join(build.directory, "llms.txt"), "utf8").trim();
  assert(llms.startsWith("# Banebooking\n"), `${build.host}: llms.txt mangler H1-tittel.`);
  assert(
    /\[[^\]]+\]\(https:\/\/banebooking\.aastk\.no\/[^)]*\)/.test(llms),
    `${build.host}: llms.txt mangler offentlig Banebooking-lenke.`
  );

  const aiCatalog = JSON.parse(
    readFileSync(join(build.directory, ".well-known/ai-catalog.json"), "utf8")
  );
  assert(
    aiCatalog.specVersion === "1.0",
    `${build.host}: ai-catalog.json mangler støttet specVersion.`
  );
  assert(
    aiCatalog.host?.displayName === "Ås tennisklubb",
    `${build.host}: ai-catalog.json mangler forventet vert.`
  );
  assert(Array.isArray(aiCatalog.entries), `${build.host}: ai-catalog.json mangler entries-array.`);

  if (build.fallback === "index.html") {
    const redirects = readFileSync(join(build.directory, "_redirects"), "utf8").trim();
    assert(redirects === "/* /index.html 200", "Cloudflare Pages: _redirects er uventet.");
  } else {
    assert(
      readFileSync(join(build.directory, ".nojekyll"), "utf8").trim() === "",
      "GitHub Pages: .nojekyll må bare inneholde whitespace."
    );
  }

  const initialFiles = new Set(initialReferences.map((reference) => buildFile(build, reference)));
  const initialJavaScript = [...initialFiles].filter((file) => file.endsWith(".js"));
  const initialCss = [...initialFiles].filter((file) => file.endsWith(".css"));
  const javaScriptFiles = listFiles(join(build.directory, "_app/immutable")).filter((file) =>
    file.endsWith(".js")
  );
  const publicBookingJavaScript = collectRouteJavaScript({
    buildDirectory: build.directory,
    initialJavaScript,
    javaScriptFiles,
    routeId: "/[[slug=tenant]]/(public)",
  });
  const lazyJavaScript = javaScriptFiles.filter((file) => !initialFiles.has(file));

  const reactRuntimeMarkers = [
    "https://react.dev/errors/",
    "__REACT_DEVTOOLS_GLOBAL_HOOK__",
    "react-stack-bottom-frame",
    "Invalid hook call.",
  ];
  const bundledReactRuntimeMarker = javaScriptFiles.find((file) => {
    const source = readFileSync(file, "utf8");
    return reactRuntimeMarkers.some((marker) => source.includes(marker));
  });
  assert(
    !bundledReactRuntimeMarker,
    `${build.host}: fant React-runtimekode i ${bundledReactRuntimeMarker}.`
  );

  const lazyMarkers = [
    { label: "Sentry", marker: "sentry_key" },
    { label: "Supabase", marker: "supabase-js-" },
    { label: "rikteksteditor", marker: "ProseMirror" },
  ];
  for (const lazyMarker of lazyMarkers) {
    const owner = javaScriptFiles.find((file) =>
      readFileSync(file, "utf8").includes(lazyMarker.marker)
    );
    assert(owner, `${build.host}: fant ikke lazy chunk for ${lazyMarker.label}.`);
    assert(!initialFiles.has(owner), `${build.host}: ${lazyMarker.label} er feilaktig preloadet.`);
  }

  const measurement = {
    host: build.host,
    initialJavaScriptGzipBytes: gzipSize(initialJavaScript),
    initialCssGzipBytes: gzipSize(initialCss),
    largestLazyJavaScriptGzipBytes: Math.max(...lazyJavaScript.map(gzipFileSize)),
    javaScriptChunkCount: javaScriptFiles.length,
    publicBookingJavaScriptGzipBytes: gzipSize(publicBookingJavaScript),
  };

  assertBudget(
    build.host,
    "initial JavaScript",
    measurement.initialJavaScriptGzipBytes,
    budgets.initialJavaScriptGzipKiB
  );
  assertBudget(
    build.host,
    "initial CSS",
    measurement.initialCssGzipBytes,
    budgets.initialCssGzipKiB
  );
  assertBudget(
    build.host,
    "largest lazy JavaScript",
    measurement.largestLazyJavaScriptGzipBytes,
    budgets.largestLazyJavaScriptGzipKiB
  );
  assertBudget(
    build.host,
    "public booking JavaScript",
    measurement.publicBookingJavaScriptGzipBytes,
    budgets.publicBookingJavaScriptGzipKiB
  );

  return measurement;
}

function collectRouteJavaScript({ buildDirectory, initialJavaScript, javaScriptFiles, routeId }) {
  const applicationEntry = initialJavaScript.find((file) => basename(file).startsWith("app."));
  assert(applicationEntry, `Fant ikke SvelteKit app-entry for ${routeId}.`);

  const routeNodeIds = readRouteNodeIds(readFileSync(applicationEntry, "utf8"), routeId);
  const routeNodes = [0, ...routeNodeIds].map((nodeId) => {
    const node = javaScriptFiles.find(
      (file) => basename(dirname(file)) === "nodes" && basename(file).startsWith(`${nodeId}.`)
    );
    assert(node, `Fant ikke klientnode ${nodeId} for ${routeId}.`);
    return node;
  });

  const availableFiles = new Set(javaScriptFiles.map((file) => normalize(file)));
  const includedFiles = new Set();
  const pendingFiles = [...initialJavaScript, ...routeNodes].map((file) => normalize(file));

  while (pendingFiles.length > 0) {
    const file = pendingFiles.pop();
    if (!file || includedFiles.has(file)) continue;
    includedFiles.add(file);

    for (const specifier of readStaticImportSpecifiers(readFileSync(file, "utf8"))) {
      if (!specifier.startsWith(".")) continue;
      const importedFile = normalize(join(dirname(file), specifier));
      const buildRelativePath = relative(buildDirectory, importedFile);
      assert(
        buildRelativePath && !buildRelativePath.startsWith(".."),
        `${routeId}: import utenfor produksjonsartefaktet: ${specifier}`
      );
      if (importedFile.endsWith(".js") && availableFiles.has(importedFile)) {
        pendingFiles.push(importedFile);
      }
    }
  }

  return [...includedFiles];
}

function readRouteNodeIds(applicationSource, routeId) {
  const escapedRouteId = escapeRegularExpression(JSON.stringify(routeId));
  const routeMatch = applicationSource.match(
    new RegExp(`${escapedRouteId}:\\[(\\d+),\\[([\\d,]*)\\]\\]`)
  );
  assert(routeMatch, `Fant ikke klientruten ${routeId} i SvelteKit app-entry.`);

  const leafNodeId = Number(routeMatch[1]);
  const layoutNodeIds = routeMatch[2]
    .split(",")
    .filter(Boolean)
    .map((value) => Number(value));
  return [...layoutNodeIds, leafNodeId];
}

function readStaticImportSpecifiers(source) {
  const imports = [];
  const staticImportPattern = /\b(?:import|export)\s*(?!\()(?:[^"']*?\bfrom\s*)?["']([^"']+)["']/g;
  for (const match of source.matchAll(staticImportPattern)) imports.push(match[1]);
  return imports;
}

function escapeRegularExpression(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readStartupReferences(html) {
  const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((reference) => /\.(?:css|js)$/.test(reference));
  return [...new Set(references)];
}

function buildFile(build, reference) {
  const pathname = new URL(reference, "https://banebooking.test").pathname;
  const relativePath = build.basePath ? pathname.slice(build.basePath.length) : pathname;
  return join(build.directory, relativePath.replace(/^\/+/, ""));
}

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function gzipSize(files) {
  return files.reduce((total, file) => total + gzipFileSize(file), 0);
}

function gzipFileSize(file) {
  return gzipSync(readFileSync(file)).byteLength;
}

function assertBudget(host, label, bytes, budgetKiB) {
  assert(
    bytes <= budgetKiB * 1024,
    `${host}: ${label} er ${formatKiB(bytes)}, over ${budgetKiB} KiB.`
  );
}

function formatKiB(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB gzip`;
}

function assert(value, message) {
  if (!value) throw new Error(message);
}
