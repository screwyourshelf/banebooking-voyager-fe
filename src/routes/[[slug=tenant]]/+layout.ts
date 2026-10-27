import { resolve } from "$app/paths";
const base = resolve("").replace(/\/$/, "");
import { publicConfig } from "#lib/platform/config/index.ts";
import { resolveTenant } from "#lib/platform/tenant/index.ts";
import { redirect } from "@sveltejs/kit";

import type { LayoutLoad } from "./$types";

export const ssr = false;
export const prerender = false;
export const trailingSlash = "never";

export const load: LayoutLoad = ({ params }) => {
  if (publicConfig.tenantSlug && params.slug) {
    redirect(307, base || "/");
  }

  const tenant = resolveTenant(params.slug, publicConfig);

  if (!tenant) {
    redirect(307, `${base}/${publicConfig.defaultSlug}`);
  }

  return { tenant };
};
