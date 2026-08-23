import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const sourceRoot = path.join(projectRoot, "src");
const packageJson = JSON.parse(await readFile(path.join(projectRoot, "package.json"), "utf8"));
const packageLock = JSON.parse(await readFile(path.join(projectRoot, "package-lock.json"), "utf8"));
const violations = [];

const forbiddenPaths = [
  "index.html",
  "components.json",
  "tsconfig.react.json",
  "src/App.tsx",
  "src/main.tsx",
  "src/supabase.ts",
  "src/config.ts",
  "src/config.test.ts",
  "src/api",
  "src/app",
  "src/auth",
  "src/components",
  "src/contexts",
  "src/features",
  "src/hooks",
  "src/providers",
  "src/types",
  "src/utils",
  "src/lib/utils.ts",
  "src/routes/BrukerdataFeil.tsx",
  "src/routes/KunngjøringGuard.tsx",
  "src/routes/LazyBrukerdataFeil.tsx",
  "src/routes/MedlemskapGuard.tsx",
  "src/routes/ProtectedRoute.tsx",
  "src/routes/SlugGate.tsx",
  "src/routes/SperretGuard.tsx",
  "src/routes/createCachedRouteLoader.ts",
  "src/routes/routeConfig.ts",
];

const forbiddenPackages = new Set([
  "@hookform/resolvers",
  "@hugeicons/react",
  "@sentry/react",
  "@tanstack/react-query",
  "@tanstack/react-query-devtools",
  "@tiptap/react",
  "@types/react",
  "@types/react-dom",
  "@vitejs/plugin-react",
  "axios",
  "class-variance-authority",
  "clsx",
  "cmdk",
  "embla-carousel-react",
  "eslint-plugin-react-hooks",
  "eslint-plugin-react-refresh",
  "input-otp",
  "lucide-react",
  "next-themes",
  "radix-ui",
  "react",
  "react-day-picker",
  "react-dom",
  "react-hook-form",
  "react-router-dom",
  "sonner",
  "tailwind-merge",
  "use-debounce",
  "vaul",
]);
const forbiddenRuntimePackages = new Set([
  "@hugeicons/react",
  "@sentry/react",
  "@tanstack/react-query",
  "@tanstack/react-query-devtools",
  "@tiptap/react",
  "axios",
  "cmdk",
  "embla-carousel-react",
  "input-otp",
  "lucide-react",
  "next-themes",
  "radix-ui",
  "react",
  "react-day-picker",
  "react-dom",
  "react-hook-form",
  "react-router-dom",
  "sonner",
  "use-debounce",
  "vaul",
]);

for (const relativePath of forbiddenPaths) {
  if (await exists(path.join(projectRoot, relativePath))) {
    violations.push(`${relativePath} er en fjernet React-rot eller kompatibilitetsbro`);
  }
}

for (const dependencyGroup of ["dependencies", "devDependencies", "peerDependencies"]) {
  for (const packageName of Object.keys(packageJson[dependencyGroup] ?? {})) {
    if (forbiddenPackages.has(packageName) || packageName.startsWith("@radix-ui/")) {
      violations.push(`package.json ${dependencyGroup} inneholder ${packageName}`);
    }
  }
}

for (const packagePath of Object.keys(packageLock.packages ?? {})) {
  const packageName = packagePath.split("node_modules/").at(-1);
  if (!packageName) continue;
  if (forbiddenRuntimePackages.has(packageName) || packageName.startsWith("@radix-ui/")) {
    violations.push(`package-lock.json inneholder den fjernede runtimepakken ${packageName}`);
  }
}

for (const filePath of await collectSourceFiles(sourceRoot)) {
  const relativePath = path.relative(projectRoot, filePath).split(path.sep).join("/");
  if (/\.(?:jsx|tsx)$/.test(filePath)) {
    violations.push(`${relativePath} er gjenværende React-kilde`);
    continue;
  }

  const source = await readFile(filePath, "utf8");
  const imports = [...source.matchAll(/(?:from\s+|import\s*(?:\(\s*)?)["']([^"']+)["']/g)].map(
    (match) => match[1]
  );

  for (const specifier of imports) {
    const packageName = packageNameFor(specifier);
    if (forbiddenPackages.has(packageName) || packageName.startsWith("@radix-ui/")) {
      violations.push(`${relativePath} importerer den fjernede pakken ${specifier}`);
    }
  }
}

if (violations.length > 0) {
  console.error("Legacy-frontendkontrollen feilet.");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("React-kilde, runtimepakker og kompatibilitetsbroer er fjernet.");

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectSourceFiles(entryPath)));
    if (entry.isFile() && /\.(?:html|jsx|svelte|tsx|js|ts)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

function packageNameFor(specifier) {
  if (specifier.startsWith("@")) return specifier.split("/").slice(0, 2).join("/");
  return specifier.split("/")[0];
}
