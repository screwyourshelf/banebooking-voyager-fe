<script lang="ts">
  import { goto } from "$app/navigation";
  import { base, resolve } from "$app/paths";
  import { publicConfig } from "$lib/platform/config";
  import { getCallbackDestination, stripBasePath } from "$lib/platform/tenant";
  import { onMount } from "svelte";

  let status = $state<"error" | "loading">("loading");
  let errorMessage = $state("");

  onMount(() => {
    let alive = true;

    void Promise.all([
      import("$lib/platform/auth/callback.client"),
      import("$lib/platform/storage/browser-storage.client"),
    ]).then(async ([{ completeAuthCallback }, storage]) => {
      if (!storage.lokalLagringErTilgjengelig()) {
        if (alive) {
          status = "error";
          errorMessage =
            "Nettleseren blokkerer lokal lagring. Tillat lagring eller nettstedsdata for å logge inn.";
        }
        return;
      }

      try {
        await completeAuthCallback();
        if (!alive) return;
        const destination = getCallbackDestination(
          publicConfig,
          storage.lesLokalLagring("slug"),
          base
        );
        await goto(resolve(stripBasePath(destination, base)), { replaceState: true });
      } catch (error) {
        if (!alive) return;
        status = "error";
        errorMessage =
          error instanceof Error ? error.message : "Innloggingen kunne ikke fullføres.";
      }
    });

    return () => {
      alive = false;
    };
  });
</script>

{#if status === "loading"}
  <div data-ui="auth-status" role="status">Logger inn …</div>
{:else}
  <section data-ui="route-error" aria-labelledby="callback-error-title">
    <h1 id="callback-error-title">Kan ikke fullføre innloggingen</h1>
    <p>{errorMessage}</p>
  </section>
{/if}
