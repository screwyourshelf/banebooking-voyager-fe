import {
  fjernFraLokalLagring,
  lesLokalLagring,
  skrivLokalLagring,
} from "$lib/platform/storage/browser-storage.client";
const SUPABASE_TOKEN_KEY = "supabase_token";

function hentSupabaseToken() {
  return lesLokalLagring(SUPABASE_TOKEN_KEY);
}

export function harSupabaseToken() {
  return Boolean(hentSupabaseToken());
}

export function synkroniserSupabaseToken(accessToken?: string) {
  if (accessToken) {
    return skrivLokalLagring(SUPABASE_TOKEN_KEY, accessToken);
  }

  return fjernFraLokalLagring(SUPABASE_TOKEN_KEY);
}
