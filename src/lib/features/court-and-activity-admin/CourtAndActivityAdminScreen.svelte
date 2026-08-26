<script lang="ts">
  import { harHandling, Kapabiliteter } from "$lib/domain";
  import { Button, Feedback, Navigation, NavigationLink, NavigationList, Page } from "$lib/ui";
  import ActivitiesSection from "./ActivitiesSection.svelte";
  import CourtsSection from "./CourtsSection.svelte";
  import type { CourtAndActivityAdminSection } from "./model";

  let {
    activitiesHref,
    capabilities,
    courtsHref,
    section,
  }: {
    activitiesHref: string;
    capabilities: readonly string[];
    courtsHref: string;
    section: CourtAndActivityAdminSection;
  } = $props();

  let createOpen = $state(false);
  const canAdministerCourts = $derived(harHandling(capabilities, Kapabiliteter.baner.admin));
  const canAdministerActivities = $derived(harHandling(capabilities, Kapabiliteter.grener.admin));
  const allowed = $derived(section === "courts" ? canAdministerCourts : canAdministerActivities);
  const actionLabel = $derived(section === "courts" ? "Ny bane" : "Ny gren");
</script>

{#snippet actions()}
  <Button onclick={() => (createOpen = true)}>{actionLabel}</Button>
{/snippet}

<Page
  eyebrow="Administrasjon"
  title="Baner og grener"
  description="Definer klubbens bookingtilbud og reglene som gjelder."
  actions={allowed ? actions : undefined}
>
  <Navigation label="Baner og grener" layout="section">
    <NavigationList>
      {#if canAdministerCourts}
        <NavigationLink href={courtsHref} label="Baner" active={section === "courts"} />
      {/if}
      {#if canAdministerActivities}
        <NavigationLink href={activitiesHref} label="Grener" active={section === "activities"} />
      {/if}
    </NavigationList>
  </Navigation>

  {#if !allowed}
    <Feedback
      tone="warning"
      title={section === "courts"
        ? "Du har ikke tilgang til baner"
        : "Du har ikke tilgang til grener"}
      description={section === "courts"
        ? "En klubbadministrator må gi deg tilgang før du kan administrere baner."
        : "En klubbadministrator må gi deg tilgang før du kan administrere grener."}
    />
  {:else if section === "courts"}
    <CourtsSection bind:createOpen />
  {:else}
    <ActivitiesSection bind:createOpen />
  {/if}
</Page>
