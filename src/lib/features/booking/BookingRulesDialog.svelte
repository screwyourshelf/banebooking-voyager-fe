<script lang="ts">
  import type { BaneRespons, GrenRespons } from "$lib/contracts";
  import { Button, Dialog, DocumentFacts, Section, SettingsStack } from "$lib/ui";
  import { getBookingRuleFacts, resolveBookingRules } from "./model";

  let {
    activity,
    court,
    disabled = false,
  }: {
    activity?: GrenRespons;
    court?: BaneRespons;
    disabled?: boolean;
  } = $props();

  let open = $state(false);
  const rules = $derived(resolveBookingRules(activity, court));
  const facts = $derived(rules ? getBookingRuleFacts(rules) : null);
  const title = $derived(
    court
      ? `Bookingregler for ${court.navn}`
      : activity
        ? `Bookingregler for ${activity.navn}`
        : "Bookingregler"
  );
</script>

<Button variant="secondary" size="small" {disabled} onclick={() => (open = true)}>
  Bookingregler
</Button>

<Dialog bind:open {title} description="Grenser, tider og varighet som gjelder når du booker.">
  {#if activity && facts}
    <SettingsStack embedded>
      <Section
        title="Hvor mye du kan booke"
        description={`Gjelder ${activity.navn.toLocaleLowerCase("nb-NO")}.`}
        variant="plain"
        padding="small"
      >
        <DocumentFacts items={facts.limits} />
      </Section>
      <Section title="Når du kan booke" variant="plain" padding="small">
        <DocumentFacts items={facts.times} />
      </Section>
    </SettingsStack>
  {/if}
</Dialog>
