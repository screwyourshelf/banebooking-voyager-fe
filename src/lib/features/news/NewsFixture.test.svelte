<script lang="ts">
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import { setApiClient, type ApiClient, type ApiRequestOptions } from "$lib/platform/api";
  import { setTenantContext } from "$lib/platform/tenant";
  import NewsScreen from "./NewsScreen.svelte";

  let { request }: { request: ApiClient["request"] } = $props();

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  setApiClient({
    request: <TResponse, TBody = never>(path: string, options?: ApiRequestOptions<TBody>) =>
      request<TResponse, TBody>(path, options),
  });
  setTenantContext({ slug: "fjordvik", source: "route" });
</script>

<QueryClientProvider client={queryClient}>
  <NewsScreen />
</QueryClientProvider>
