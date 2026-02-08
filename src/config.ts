export const config = {
  // Auth / backend
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL!,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
  apiBaseUrl:
    import.meta.env.MODE === "development"
      ? "" // bruk Vite proxy
      : import.meta.env.VITE_API_BASE_URL || "",

  // App
  defaultSlug: import.meta.env.VITE_DEFAULT_SLUG ?? "aas-tennisklubb",

  // Routing
  baseUrl: import.meta.env.BASE_URL,

  // UI
  feedDismissDurationMs: 24 * 60 * 60 * 1000,
};
