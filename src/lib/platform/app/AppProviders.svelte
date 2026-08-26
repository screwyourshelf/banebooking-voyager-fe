<script lang="ts">
  import { dev } from "$app/environment";
  import { setApiClient, type ApiClient, type ApiRequestOptions } from "$lib/platform/api";
  import { setAuthContext, type AuthContextValue } from "$lib/platform/auth";
  import { createAppQueryClient } from "$lib/platform/query";
  import { setTenantContext, type TenantContext } from "$lib/platform/tenant";
  import { QueryClientProvider } from "@tanstack/svelte-query";
  import { onMount, type Component, type Snippet } from "svelte";
  import type { AuthController, AuthState } from "$lib/platform/auth";

  type AppRuntime = {
    api: ApiClient;
    auth: AuthController;
    initialize(): Promise<void>;
    destroy(): void;
  };

  let { children, tenant }: { children: Snippet; tenant: TenantContext } = $props();

  const queryClient = createAppQueryClient();
  let authState = $state<AuthState>({ status: "initializing", user: null });
  let runtime: AppRuntime | null = null;
  let resolveController: (controller: AuthController | null) => void;
  const controllerReady = new Promise<AuthController | null>((resolve) => {
    resolveController = resolve;
  });
  let resolveApiClient: (api: ApiClient | null) => void;
  const apiClientReady = new Promise<ApiClient | null>((resolve) => {
    resolveApiClient = resolve;
  });
  let QueryDevtools = $state<Component | null>(null);

  async function requireController() {
    const readyController = runtime?.auth ?? (await controllerReady);
    if (!readyController) throw new Error("Authplattformen kunne ikke startes.");
    return readyController;
  }

  const auth: AuthContextValue = {
    get state() {
      return authState;
    },
    async signOut() {
      queryClient.clear();
      await (await requireController()).signOut();
    },
    async signInAsDevelopmentProfile(profile) {
      await (await requireController()).signInAsDevelopmentProfile(profile);
    },
    async signInWithOAuth(provider, redirectTo) {
      await (await requireController()).signInWithOAuth(provider, redirectTo);
    },
    async sendEmailOtp(email, redirectTo) {
      await (await requireController()).sendEmailOtp(email, redirectTo);
    },
    async verifyEmailOtp(email, token) {
      await (await requireController()).verifyEmailOtp(email, token);
    },
  };

  const tenantContext: TenantContext = {
    get slug() {
      return tenant.slug;
    },
    get source() {
      return tenant.source;
    },
  };

  setTenantContext(tenantContext);
  setAuthContext(auth);

  const api: ApiClient = {
    async request<TResponse, TBody = never>(
      path: string,
      options: ApiRequestOptions<TBody>
    ): Promise<TResponse> {
      const readyApi = await apiClientReady;
      if (!readyApi) throw new Error("API-plattformen kunne ikke startes.");
      return readyApi.request<TResponse, TBody>(path, options);
    },
  };
  setApiClient(api);

  onMount(() => {
    let alive = true;

    void import("./browser-runtime.client")
      .then(async (browserRuntime) => {
        if (!alive || !browserRuntime) return;
        runtime = browserRuntime.createBrowserAppRuntime({
          getTenant: () => tenantContext,
          onAuthState: (state) => {
            authState = state;
          },
          queryClient,
        });
        resolveController(runtime.auth);
        resolveApiClient(runtime.api);
        await runtime.initialize();
      })
      .catch((error) => {
        if (!alive) return;
        void import("./browser-startup.client").then(({ getBrowserObservability }) => {
          getBrowserObservability().captureException(error, {
            source: "app-runtime.initialize",
          });
        });
        authState = { status: "anonymous", user: null };
        resolveController(null);
        resolveApiClient(null);
      });

    if (dev) {
      void import("./QueryDevtools.client.svelte").then((module) => {
        if (alive) QueryDevtools = module.default;
      });
    }

    return () => {
      alive = false;
      runtime?.destroy();
    };
  });
</script>

<QueryClientProvider client={queryClient}>
  {@render children()}
  {#if QueryDevtools}
    <QueryDevtools />
  {/if}
</QueryClientProvider>
