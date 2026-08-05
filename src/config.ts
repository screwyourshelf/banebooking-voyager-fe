export function lesSupabasePublishableKey(value?: string) {
  const publishableKey = value?.trim() ?? "";

  if (publishableKey && !publishableKey.startsWith("sb_publishable_")) {
    throw new Error("VITE_SUPABASE_PUBLISHABLE_KEY må starte med sb_publishable_.");
  }

  return publishableKey;
}

export const config = {
  // Auth / backend
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL!,
  supabasePublishableKey: lesSupabasePublishableKey(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY),
  apiBaseUrl:
    import.meta.env.MODE === "development"
      ? "" // bruk Vite proxy
      : import.meta.env.VITE_API_BASE_URL || "",

  // App
  defaultSlug: import.meta.env.VITE_DEFAULT_SLUG ?? "aas-tennisklubb",
  tenantSlug: (import.meta.env.VITE_TENANT_SLUG as string | undefined) || null,

  // Routing
  baseUrl: import.meta.env.BASE_URL,

  // UI
  feedDismissDurationMs: 24 * 60 * 60 * 1000,

  // Feature flags
  enableIdrettensId: import.meta.env.VITE_ENABLE_IDRETTENS_ID === "true",
};
