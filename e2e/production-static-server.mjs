import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const options = readOptions(process.argv.slice(2));
const rootDirectory = resolve(options.root);
const fallbackPath = resolveInsideRoot(options.fallback);

const contentTypes = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
]);

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }

  try {
    const requestPath = decodeURIComponent(
      new URL(request.url ?? "/", "http://localhost").pathname
    );
    const sitePath = stripBasePath(requestPath, options.basePath);
    if (sitePath === null) {
      response.writeHead(404);
      response.end();
      return;
    }

    const resolvedAsset = await resolveAsset(sitePath);
    if (resolvedAsset) {
      serveFile(resolvedAsset, response, request.method === "HEAD");
      return;
    }

    response.setHeader("X-Banebooking-Static-Fallback", options.fallback);
    serveFile(fallbackPath, response, request.method === "HEAD");
  } catch {
    response.writeHead(400);
    response.end();
  }
});

server.listen(options.port, "127.0.0.1");

process.on("SIGTERM", () => server.close());
process.on("SIGINT", () => server.close());

async function resolveAsset(sitePath) {
  const relativePath = sitePath.replace(/^\/+/, "");
  const candidates = relativePath
    ? [relativePath, `${relativePath}.html`, `${relativePath}/index.html`]
    : ["index.html"];

  for (const candidate of candidates) {
    const filePath = resolveInsideRoot(candidate);
    const fileStat = await stat(filePath).catch(() => null);
    if (fileStat?.isFile()) return filePath;
  }

  return null;
}

function serveFile(filePath, response, headOnly) {
  response.statusCode = 200;
  response.setHeader("Cache-Control", "no-store");
  response.setHeader(
    "Content-Type",
    contentTypes.get(extname(filePath)) ?? "application/octet-stream"
  );
  response.setHeader("X-Content-Type-Options", "nosniff");
  if (headOnly) {
    response.end();
    return;
  }
  createReadStream(filePath).pipe(response);
}

function resolveInsideRoot(relativePath) {
  const filePath = resolve(rootDirectory, relativePath);
  if (filePath !== rootDirectory && !filePath.startsWith(`${rootDirectory}${sep}`)) {
    throw new Error("Filstien går utenfor produksjonsartefaktet.");
  }
  return filePath;
}

function stripBasePath(pathname, basePath) {
  if (!basePath) return pathname;
  if (pathname === basePath) return "/";
  return pathname.startsWith(`${basePath}/`) ? pathname.slice(basePath.length) : null;
}

function readOptions(args) {
  const values = new Map();
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!key?.startsWith("--") || !value) throw new Error("Ugyldige static-host-argumenter.");
    values.set(key.slice(2), value);
  }

  const root = values.get("root");
  const fallback = values.get("fallback");
  const port = Number(values.get("port"));
  if (!root || !fallback || !Number.isInteger(port) || port < 1) {
    throw new Error("Static-host krever --root, --port og --fallback.");
  }

  const configuredBase = values.get("base")?.replace(/\/+$/, "") ?? "";
  if (configuredBase && !configuredBase.startsWith("/")) {
    throw new Error("Static-host-base må starte med /.");
  }

  return { basePath: configuredBase, fallback, port, root };
}
