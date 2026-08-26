<script lang="ts">
  import type { MinBookingRespons } from "$lib/contracts";
  import { Kapabiliteter, harHandling } from "$lib/domain";
  import { Button, CollectionRow, ScheduleTime, Weather } from "$lib/ui";
  import { buildBookingKey } from "./model";

  let {
    booking,
    busy = false,
    onCancel,
  }: {
    booking: MinBookingRespons;
    busy?: boolean;
    onCancel: (booking: MinBookingRespons) => void;
  } = $props();

  const canCancel = $derived(
    Boolean(booking.bookingId) && harHandling(booking.kapabiliteter, Kapabiliteter.booking.fjern)
  );
  const hasWeather = $derived(
    Boolean(booking.værSymbol) ||
      typeof booking.temperatur === "number" ||
      typeof booking.vind === "number"
  );
</script>

{#snippet weather()}
  <Weather
    compact
    symbol={booking.værSymbol}
    temperature={booking.temperatur}
    wind={booking.vind}
  />
{/snippet}

{#snippet time()}
  <ScheduleTime
    start={booking.startTid.slice(0, 5)}
    end={booking.sluttTid.slice(0, 5)}
    accessory={hasWeather ? weather : undefined}
  />
{/snippet}

{#snippet cancelAction()}
  <Button variant="destructive" size="small" disabled={busy} onclick={() => onCancel(booking)}>
    {busy ? "Avbestiller …" : "Avbestill"}
  </Button>
{/snippet}

<CollectionRow
  layout="schedule"
  leading={time}
  title={booking.baneNavn}
  description={booking.grenNavn}
  muted={booking.erPassert}
  {busy}
  interaction={canCancel
    ? { type: "expand", value: buildBookingKey(booking), actions: cancelAction }
    : { type: "static" }}
/>
