import { base } from "$app/paths";
import { publicConfig } from "$lib/platform/config";
import { redirect } from "@sveltejs/kit";

import type { LayoutLoad } from "./$types";

export const ssr = false;
export const prerender = false;
export const trailingSlash = "never";

export const load: LayoutLoad = ({ params }) => {
  const slug = params.slug ?? publicConfig.tenantSlug;

  if (!slug) {
    redirect(307, `${base}/${publicConfig.defaultSlug}`);
  }

  return {
    tenant: {
      slug,
      source: params.slug ? ("route" as const) : ("build" as const),
    },
  };
};
