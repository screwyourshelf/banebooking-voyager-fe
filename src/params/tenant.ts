import { isTenantRouteSlug } from "#lib/platform/config/tenant-slug.ts";

export const match = (param: string) => isTenantRouteSlug(param);
