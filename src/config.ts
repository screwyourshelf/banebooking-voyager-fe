export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL!,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
  apiBaseUrl:
    import.meta.env.MODE === "development"
      ? "" // bruk Vite proxy
      : import.meta.env.VITE_API_BASE_URL || "",
};
