import { config } from "@/config";

export function buildTenantRoute(slug: string, path = "") {
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, "");
  const normalizedPath = path.replace(/^\/+|\/+$/g, "");

  if (config.tenantSlug) {
    return normalizedPath ? `/${normalizedPath}` : "/";
  }

  return normalizedPath ? `/${normalizedSlug}/${normalizedPath}` : `/${normalizedSlug}`;
}
