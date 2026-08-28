<script lang="ts">
  import type { BaneRespons, BookingstatusRespons, GrenRespons } from "$lib/contracts";
  import { Button, Dialog, DocumentFacts, Section, SettingsStack, SettingsText } from "$lib/ui";
  import { getBookingLimitCopy, getBookingLimitFacts } from "./model";

  let {
    activity,
    bookingstatus,
    court,
    disabled = false,
    maxDate,
  }: {
    activity?: GrenRespons;
    bookingstatus: BookingstatusRespons | null;
    court?: BaneRespons;
    disabled?: boolean;
    maxDate: string;
  } = $props();
  let open = $state(false);
  const settings = $derived(court?.bookingInnstillinger ?? activity?.bookingInnstillinger);
  const facts = $derived(settings ? getBookingLimitFacts(settings, bookingstatus, maxDate) : null);
  const copy = $derived(activity && court ? getBookingLimitCopy(activity, court) : null);
  const title = $derived(court ? `Grenser og tider for ${court.navn}` : "Grenser og tider");
</script>

<Button variant="secondary" size="small" {disabled} onclick={() => (open = true)}>
  Grenser og tider
</Button>
<Dialog bind:open {title} description="Se din status og hva som gjelder når du booker.">
  {#if activity && court && facts && copy}
    <SettingsStack embedded>
      <Section
        title={bookingstatus
          ? `Din status i ${activity.navn}`
          : `Bookinggrenser i ${activity.navn}`}
        description={copy.quotaDescription}
        variant="plain"
        padding="small"
      >
        <DocumentFacts items={facts.quotas} label="Bookinggrenser og status" />
        <SettingsText
          >{bookingstatus?.erUnntattKvoter
            ? copy.exemptExplanation
            : copy.quotaExplanation}</SettingsText
        >
      </Section>
      <Section
        title={`Tider på ${court.navn}`}
        description={copy.timeDescription}
        variant="plain"
        padding="small"
      >
        <DocumentFacts items={facts.times} label="Tider og bookinghorisont" />
        <SettingsText>{copy.timeExplanation}</SettingsText>
      </Section>
    </SettingsStack>
  {/if}
</Dialog>
