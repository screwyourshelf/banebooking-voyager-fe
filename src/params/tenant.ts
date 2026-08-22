import type { ParamMatcher } from "@sveltejs/kit";
import { isTenantRouteSlug } from "$lib/platform/config";

export const match: ParamMatcher = (param) => isTenantRouteSlug(param);
