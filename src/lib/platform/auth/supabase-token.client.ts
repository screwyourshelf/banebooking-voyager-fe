import {
  fjernFraLokalLagring,
  lesLokalLagring,
  skrivLokalLagring,
} from "$lib/platform/storage/browser-storage.client";
import { SIGN_IN_STORAGE_REQUIRED_MESSAGE } from "./types";

const SUPABASE_TOKEN_KEY = "supabase_token";

export const LOKAL_LAGRING_KREVES_FOR_INNLOGGING = SIGN_IN_STORAGE_REQUIRED_MESSAGE;

export function hentSupabaseToken() {
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
