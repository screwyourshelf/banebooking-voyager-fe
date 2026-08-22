import { isTenantRouteSlug, type PublicConfig } from "$lib/platform/config";

export type AppPath = `/${string}`;

export type TenantContext = {
  slug: string;
  source: "build" | "route";
};

export function resolveTenant(
  routeSlug: string | undefined,
  config: Pick<PublicConfig, "tenantSlug">
): TenantContext | null {
  const slug = config.tenantSlug ?? routeSlug;
  if (!slug) return null;
  return { slug, source: config.tenantSlug ? "build" : "route" };
}

export function buildTenantPath(tenant: TenantContext, relativePath = "", basePath = ""): AppPath {
  const normalizedBase = normalizePathPart(basePath);
  const tenantPart = tenant.source === "route" ? tenant.slug : "";
  const pathPart = normalizePathPart(relativePath);
  const segments = [normalizedBase, tenantPart, pathPart].filter(Boolean);
  return `/${segments.join("/")}`;
}

export function buildLoginPath(
  tenant: TenantContext,
  currentUrl: Pick<URL, "hash" | "pathname" | "search">,
  basePath = ""
): AppPath {
  const login = buildTenantPath(tenant, "login", basePath);
  const returnTo = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
  const params = new URLSearchParams({ returnTo });
  return `${login}?${params}`;
}

export function readSafeReturnPath(
  value: string | null,
  tenant: TenantContext,
  basePath = ""
): AppPath | null {
  if (!value?.startsWith("/") || value.startsWith("//")) return null;
  const tenantRoot = buildTenantPath(tenant, "", basePath);
  const normalizedRoot = tenantRoot.endsWith("/") ? tenantRoot : `${tenantRoot}/`;
  if (value !== tenantRoot && !value.startsWith(normalizedRoot)) return null;
  if (value.split(/[?#]/, 1)[0].endsWith("/login")) return null;
  return value as AppPath;
}

export function getCallbackDestination(
  config: Pick<PublicConfig, "defaultSlug" | "tenantSlug">,
  lastSlug: string | null,
  basePath = "",
  returnTo: string | null = null
): AppPath {
  const safeLastSlug = lastSlug && isTenantRouteSlug(lastSlug) ? lastSlug : null;
  const tenant = resolveTenant(
    config.tenantSlug ? undefined : safeLastSlug || config.defaultSlug,
    config
  );
  if (!tenant) throw new Error("Kunne ikke fastsette tenant etter innlogging.");
  return readSafeReturnPath(returnTo, tenant, basePath) ?? buildTenantPath(tenant, "", basePath);
}

/** Fjerner SvelteKit-base path før en intern path sendes gjennom `$app/paths.resolve`. */
export function stripBasePath(path: AppPath, basePath = ""): AppPath {
  const normalizedBase = normalizePathPart(basePath);
  if (!normalizedBase) return path;

  const prefix = `/${normalizedBase}`;
  if (path === prefix) return "/";
  if (path.startsWith(`${prefix}/`)) {
    return path.slice(prefix.length) as AppPath;
  }
  if (path.startsWith(`${prefix}?`) || path.startsWith(`${prefix}#`)) {
    return `/${path.slice(prefix.length)}`;
  }

  throw new Error(`Intern path ligger utenfor konfigurert base path: ${path}`);
}

function normalizePathPart(value: string) {
  return value.trim().replace(/^\/+|\/+$/g, "");
}
