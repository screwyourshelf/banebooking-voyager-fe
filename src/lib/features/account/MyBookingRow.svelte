<script lang="ts">
  import type { BrukerBookingRespons } from "$lib/contracts";
  import { Kapabiliteter, harHandling, buildBookingKey } from "$lib/domain";
  import { Button, ScheduleRow } from "$lib/ui";

  let {
    booking,
    busy = false,
    onCancel,
  }: {
    booking: BrukerBookingRespons;
    busy?: boolean;
    onCancel: (booking: BrukerBookingRespons) => void;
  } = $props();

  const canCancel = $derived(
    Boolean(booking.bookingId) && harHandling(booking.kapabiliteter, Kapabiliteter.booking.fjern)
  );
</script>

{#snippet cancelAction()}
  <Button variant="destructive" size="small" disabled={busy} onclick={() => onCancel(booking)}>
    {busy ? "Avbestiller …" : "Avbestill"}
  </Button>
{/snippet}

<ScheduleRow
  id={buildBookingKey(booking)}
  start={booking.startTid}
  end={booking.sluttTid}
  title={booking.baneNavn}
  description={booking.grenNavn}
  muted={booking.erPassert}
  weather={{ symbol: booking.værSymbol, temperature: booking.temperatur, wind: booking.vind }}
  {busy}
  actions={canCancel ? cancelAction : undefined}
/>
