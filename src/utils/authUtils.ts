import { config } from "@/config";
import { fjernUtviklingssession } from "@/auth/developmentSession";
import { synkroniserSupabaseToken } from "@/auth/supabaseToken";
import { getSupabaseClient } from "@/supabase";
import { lesLokalLagring } from "@/utils/browserStorage";

function buildRedirectUrl() {
  if (config.tenantSlug) {
    return window.location.origin + "/";
  }

  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
  const slug = (lesLokalLagring("slug") || config.defaultSlug).replace(/^\/+|\/+$/g, "");

  return base ? `${window.location.origin}${base}/${slug}` : `${window.location.origin}/${slug}`;
}

export async function signOutAndRedirect() {
  const redirectTo = buildRedirectUrl();
  fjernUtviklingssession();
  synkroniserSupabaseToken();
  const supabase = await getSupabaseClient();
  await supabase.auth.signOut();
  window.location.assign(redirectTo);
}
