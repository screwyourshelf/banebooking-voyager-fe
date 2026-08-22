import { fjernFraLokalLagring, lesLokalLagring, skrivLokalLagring } from "@/utils/browserStorage";

const SUPABASE_TOKEN_KEY = "supabase_token";

export const LOKAL_LAGRING_KREVES_FOR_INNLOGGING =
  "Nettleseren blokkerer lokal lagring. Tillat lagring eller nettstedsdata for denne siden for å logge inn.";

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
