<script lang="ts">
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import { setApiClient, type ApiClient, type ApiRequestOptions } from "$lib/platform/api";
  import { setTenantContext } from "$lib/platform/tenant";
  import CourtAndActivityAdminScreen from "./CourtAndActivityAdminScreen.svelte";
  import type { CourtAndActivityAdminSection } from "./model";

  let {
    capabilities = ["baner:admin", "grener:admin"],
    request,
    section = "courts",
  }: {
    capabilities?: string[];
    request: ApiClient["request"];
    section?: CourtAndActivityAdminSection;
  } = $props();

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
  <CourtAndActivityAdminScreen
    {section}
    {capabilities}
    courtsHref="/fjordvik/admin/baner"
    activitiesHref="/fjordvik/admin/grener"
  />
</QueryClientProvider>
