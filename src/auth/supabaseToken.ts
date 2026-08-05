const SUPABASE_TOKEN_KEY = "supabase_token";

export function hentSupabaseToken() {
  return localStorage.getItem(SUPABASE_TOKEN_KEY);
}

export function harSupabaseToken() {
  return Boolean(hentSupabaseToken());
}

export function synkroniserSupabaseToken(accessToken?: string) {
  if (accessToken) {
    localStorage.setItem(SUPABASE_TOKEN_KEY, accessToken);
    return;
  }

  localStorage.removeItem(SUPABASE_TOKEN_KEY);
}
