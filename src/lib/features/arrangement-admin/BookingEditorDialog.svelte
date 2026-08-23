<script lang="ts">
  import type { BaneRespons } from "$lib/contracts";
  import {
    Button,
    DatePicker,
    Dialog,
    Form,
    FormField,
    FormFields,
    Select,
    SettingsRow,
    SettingsSection,
    SettingsStack,
    SettingsValue,
  } from "$lib/ui";
  import { addMinutes, generateStartTimes, getCourtSlotLength, type LocalBooking } from "./model";

  let {
    booking,
    busy = false,
    courts,
    onDelete,
    onSave,
    open = $bindable(false),
  }: {
    booking: LocalBooking | null;
    busy?: boolean;
    courts: readonly BaneRespons[];
    onDelete: (booking: LocalBooking) => void | Promise<void>;
    onSave: (original: LocalBooking, updated: LocalBooking) => void | Promise<void>;
    open?: boolean;
  } = $props();

  let synchronizedId = $state("");
  let date = $state("");
  let courtId = $state("");
  let startTime = $state("");

  $effect(() => {
    if (!booking || booking.id === synchronizedId) return;
    synchronizedId = booking.id;
    date = booking.date;
    courtId = booking.courtId;
    startTime = booking.startTime;
  });

  const selectedCourt = $derived(courts.find((court) => court.id === courtId));
  const slotLength = $derived(selectedCourt ? getCourtSlotLength(selectedCourt) : 60);
  const startTimes = $derived(
    selectedCourt
      ? generateStartTimes(
          selectedCourt.bookingInnstillinger.aapningstid || "08:00",
          selectedCourt.bookingInnstillinger.stengetid || "22:00",
          slotLength
        )
      : []
  );
  const endTime = $derived(startTime ? addMinutes(startTime, slotLength) : "");
  const valid = $derived(Boolean(booking && date && selectedCourt && startTime));

  function selectCourt(nextCourtId: string) {
    courtId = nextCourtId;
    startTime = "";
  }

  async function save() {
    if (!booking || !selectedCourt || !valid) return;
    await onSave(booking, {
      ...booking,
      courtId,
      courtName: selectedCourt.navn,
      date,
      endTime,
      message: undefined,
      startTime,
      status: booking.source === "existing" ? "active" : "unknown",
    });
    open = false;
  }

  async function remove() {
    if (!booking) return;
    await onDelete(booking);
    open = false;
  }
</script>

{#snippet actions({ close }: { close: () => void })}
  <Button variant="destructive" disabled={busy} onclick={() => void remove()}>
    {booking?.source === "existing" ? "Avlys banetid" : "Fjern forslag"}
  </Button>
  <Button variant="secondary" disabled={busy} onclick={close}>Avbryt</Button>
  <Button disabled={!valid || busy} onclick={() => void save()}>Lagre endring</Button>
{/snippet}

<Dialog
  bind:open
  title="Rediger banetid"
  description="Endre dato, bane eller starttid."
  pending={busy}
  {actions}
>
  <Form pending={busy}>
    <SettingsStack>
      <SettingsSection
        eyebrow="Booking"
        title="Tid og bane"
        description="Sluttiden beregnes ut fra banens varighet."
      >
        <FormFields>
          <FormField label="Dato" required>
            <DatePicker bind:value={date} disabled={busy} showDayNavigation />
          </FormField>
          <FormField label="Bane" required>
            <Select
              options={courts.map((court) => ({ value: court.id, label: court.navn }))}
              value={courtId}
              onValueChange={selectCourt}
              disabled={busy}
            />
          </FormField>
          <FormField label="Starttid" required>
            <Select
              options={startTimes.map((time) => ({ value: time, label: time }))}
              bind:value={startTime}
              disabled={busy || !courtId}
              placeholder="Velg tidspunkt…"
            />
          </FormField>
          {#if endTime}
            {#snippet endValue()}<SettingsValue>{endTime}</SettingsValue>{/snippet}
            <SettingsRow title="Sluttid" description={`${slotLength} minutter`} right={endValue} />
          {/if}
        </FormFields>
      </SettingsSection>
    </SettingsStack>
  </Form>
</Dialog>
