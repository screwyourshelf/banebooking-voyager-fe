import { createAuthController } from "./controller";
import { createCompositeAuthAdapter } from "./composite-adapter.client";
import { createDevelopmentAuthAdapter } from "./development-adapter.client";
import { createSupabaseAuthAdapter } from "./supabase-adapter.client";

export function createBrowserAuthController(fetch: typeof globalThis.fetch) {
  return createAuthController(
    createCompositeAuthAdapter(createDevelopmentAuthAdapter({ fetch }), createSupabaseAuthAdapter())
  );
}
