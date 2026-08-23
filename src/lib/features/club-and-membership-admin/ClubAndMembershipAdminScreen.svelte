<script lang="ts">
  import type { KlubbRespons } from "$lib/contracts";
  import { harHandling, Kapabiliteter } from "$lib/domain";
  import { Feedback, Page, Tabs } from "$lib/ui";
  import ClubSettings from "./ClubSettings.svelte";
  import MembershipSettings from "./MembershipSettings.svelte";

  let {
    capabilities,
    club,
  }: {
    capabilities: readonly string[];
    club: KlubbRespons;
  } = $props();

  let activeSection = $state("club-profile");
  const canAdministerClub = $derived(harHandling(capabilities, Kapabiliteter.klubb.admin));
  const canManageMembership = $derived(harHandling(capabilities, Kapabiliteter.medlemskap.aktiver));
</script>

{#snippet clubProfile()}<ClubSettings {club} />{/snippet}
{#snippet membership()}<MembershipSettings canManage={canManageMembership} />{/snippet}

<Page
  eyebrow="Administrasjon"
  title="Klubbinnstillinger"
  description="Oppdater klubbprofilen og styr tjenester og medlemsbekreftelse."
>
  {#if !canAdministerClub}
    <Feedback
      tone="warning"
      title="Du har ikke tilgang til klubbinnstillinger"
      description="En klubbadministrator må gi deg tilgang før du kan endre klubbens innstillinger."
    />
  {:else}
    <Tabs
      label="Innstillingsområder"
      bind:value={activeSection}
      items={[
        { value: "club-profile", label: "Klubbprofil", content: clubProfile },
        { value: "membership", label: "Medlemskap", content: membership },
      ]}
    />
  {/if}
</Page>
