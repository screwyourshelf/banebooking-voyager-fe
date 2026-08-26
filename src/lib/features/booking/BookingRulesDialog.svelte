<script lang="ts">
  import type { BaneRespons, GrenRespons } from "$lib/contracts";
  import { Button, Dialog, DocumentFacts, Section, SettingsStack, SettingsText } from "$lib/ui";
  import { getBookingRuleCopy, getBookingRuleFacts, resolveBookingRules } from "./model";

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
  const copy = $derived(activity ? getBookingRuleCopy(activity, court) : null);
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
<Dialog bind:open {title} description="Her ser du hvor mye og når du kan booke.">
  {#if activity && facts}
    <SettingsStack embedded>
      <Section
        title="Dine bookinggrenser"
        description={copy?.scopeDescription}
        variant="plain"
        padding="small"
      >
        <DocumentFacts items={facts.limits} label="Bookinggrenser" />
        <SettingsText>{copy?.limitsExplanation}</SettingsText>
      </Section>
      <Section title="Tid og varighet" variant="plain" padding="small">
        <DocumentFacts items={facts.times} label="Tid og varighet" />
      </Section>
    </SettingsStack>
  {/if}
</Dialog>
