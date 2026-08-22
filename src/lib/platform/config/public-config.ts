const DEFAULT_SLUG = "aas-tennisklubb";
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type PublicEnvironment = Pick<
  ImportMetaEnv,
  | "VITE_API_BASE_URL"
  | "VITE_DEFAULT_SLUG"
  | "VITE_ENABLE_IDRETTENS_ID"
  | "VITE_SENTRY_DSN"
  | "VITE_SUPABASE_PUBLISHABLE_KEY"
  | "VITE_SUPABASE_URL"
  | "VITE_TENANT_SLUG"
>;

export type PublicConfig = {
  apiBaseUrl: string;
  defaultSlug: string;
  enableIdrettensId: boolean;
  sentryDsn: string;
  supabasePublishableKey: string;
  supabaseUrl: string;
  tenantSlug: string | null;
};

export function readPublicConfig(environment: PublicEnvironment): PublicConfig {
  return {
    apiBaseUrl: trimTrailingSlash(environment.VITE_API_BASE_URL),
    defaultSlug: readSlug(environment.VITE_DEFAULT_SLUG || DEFAULT_SLUG, "VITE_DEFAULT_SLUG"),
    enableIdrettensId: environment.VITE_ENABLE_IDRETTENS_ID === "true",
    sentryDsn: environment.VITE_SENTRY_DSN?.trim() ?? "",
    supabasePublishableKey: environment.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "",
    supabaseUrl: trimTrailingSlash(environment.VITE_SUPABASE_URL),
    tenantSlug: environment.VITE_TENANT_SLUG
      ? readSlug(environment.VITE_TENANT_SLUG, "VITE_TENANT_SLUG")
      : null,
  };
}

function readSlug(value: string, variableName: string) {
  const slug = value.trim().toLowerCase();
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(`${variableName} må være en URL-vennlig slug.`);
  }
  return slug;
}

function trimTrailingSlash(value?: string) {
  return value?.trim().replace(/\/+$/, "") ?? "";
}
