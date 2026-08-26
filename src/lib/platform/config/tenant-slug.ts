const TENANT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED_TENANT_SEGMENTS = new Set(["_app", "admin", "api", "auth"]);

export function isTenantSlug(value: string): boolean {
  return TENANT_SLUG_PATTERN.test(value);
}

export function isTenantRouteSlug(value: string): boolean {
  return isTenantSlug(value) && !RESERVED_TENANT_SEGMENTS.has(value.toLowerCase());
}
