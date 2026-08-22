declare global {
  namespace App {
    interface Error {
      message: string;
    }
  }

  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string;
    readonly VITE_BASE_PATH?: string;
    readonly VITE_DEFAULT_SLUG?: string;
    readonly VITE_ENABLE_IDRETTENS_ID?: string;
    readonly VITE_SENTRY_DSN?: string;
    readonly VITE_STATIC_HOST?: "cloudflare-pages" | "github-pages";
    readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
    readonly VITE_SUPABASE_URL?: string;
    readonly VITE_TENANT_SLUG?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
