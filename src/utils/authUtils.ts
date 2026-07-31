import { supabase } from "@/supabase";
import { config } from "@/config";
import { fjernUtviklingssession } from "@/auth/developmentSession";

function buildRedirectUrl() {
  if (config.tenantSlug) {
    return window.location.origin + "/";
  }

  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
  const slug = (localStorage.getItem("slug") || config.defaultSlug).replace(/^\/+|\/+$/g, "");

  return base ? `${window.location.origin}${base}/${slug}` : `${window.location.origin}/${slug}`;
}

export async function signOutAndRedirect() {
  const redirectTo = buildRedirectUrl();
  fjernUtviklingssession();
  localStorage.removeItem("supabase_token");
  await supabase.auth.signOut();
  window.location.assign(redirectTo);
}
