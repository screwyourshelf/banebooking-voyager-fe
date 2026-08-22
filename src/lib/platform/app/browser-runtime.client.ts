import { goto } from "$app/navigation";
import { base, resolve } from "$app/paths";
import { createApiClient, type ApiClient } from "$lib/platform/api";
import { createBrowserAuthController } from "$lib/platform/auth/browser-auth.client";
import type { AuthController, AuthState } from "$lib/platform/auth";
import { publicConfig } from "$lib/platform/config";
import type { QueryClient } from "@tanstack/svelte-query";
import { buildLoginPath, stripBasePath, type TenantContext } from "$lib/platform/tenant";

export type BrowserAppRuntime = {
  api: ApiClient;
  auth: AuthController;
  initialize(): Promise<void>;
  destroy(): void;
};

type BrowserAppRuntimeOptions = {
  getTenant: () => TenantContext;
  onAuthState: (state: AuthState) => void;
  queryClient: QueryClient;
};

/**
 * Eies av browser-runtimegrensen fordi både auth-SDK, native fetch og navigasjon er sideeffekter.
 * AppProviders publiserer bare stabile context-fasader som venter på denne instansen.
 */
export function createBrowserAppRuntime({
  getTenant,
  onAuthState,
  queryClient,
}: BrowserAppRuntimeOptions): BrowserAppRuntime {
  const browserFetch = globalThis.fetch.bind(globalThis);
  const auth = createBrowserAuthController(browserFetch);
  const unsubscribe = auth.subscribe(onAuthState);
  const apiBaseUrl = publicConfig.apiBaseUrl ? `${publicConfig.apiBaseUrl}/api` : "/api";
  const api = createApiClient({
    fetch: browserFetch,
    baseUrl: apiBaseUrl,
    getAccessToken: () => auth.getAccessToken(),
    onUnauthorized: async () => {
      queryClient.clear();
      await auth.signOut().catch(() => undefined);
      const target = buildLoginPath(getTenant(), new URL(globalThis.location.href), base);
      const separator = target.includes("?") ? "&" : "?";
      const sessionExpiredTarget = `${target}${separator}sessionExpired=1` as const;
      await goto(resolve(stripBasePath(sessionExpiredTarget, base)), { replaceState: true });
    },
  });

  return {
    api,
    auth,
    initialize: () => auth.initialize(),
    destroy() {
      unsubscribe();
      auth.destroy();
    },
  };
}
