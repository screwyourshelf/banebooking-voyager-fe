import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const budgets = {
  initialCssGzipKiB: 50,
  initialJavaScriptGzipKiB: 50,
  largestLazyJavaScriptGzipKiB: 130,
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

  return measurement;
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
