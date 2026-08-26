import { readPublicConfig } from "./public-config";

export const publicConfig = readPublicConfig({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_DEFAULT_SLUG: import.meta.env.VITE_DEFAULT_SLUG,
  VITE_ENABLE_IDRETTENS_ID: import.meta.env.VITE_ENABLE_IDRETTENS_ID,
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_TENANT_SLUG: import.meta.env.VITE_TENANT_SLUG,
});
