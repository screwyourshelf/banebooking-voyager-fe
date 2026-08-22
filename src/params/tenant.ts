import type { ParamMatcher } from "@sveltejs/kit";

const RESERVED_SEGMENTS = new Set(["_app", "admin", "api", "auth"]);
const TENANT_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const match: ParamMatcher = (param) =>
  TENANT_PATTERN.test(param) && !RESERVED_SEGMENTS.has(param.toLowerCase());
