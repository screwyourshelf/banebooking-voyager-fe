<script lang="ts">
  import { Feedback, SettingsChoiceGroup } from "#lib/ui/index.ts";
  import { arrangementSlotKey } from "./arrangement-slots";
  import type { ArrangementTimeSelection } from "./arrangement-time-selection.svelte";

  let {
    disabled = false,
    selection,
    submitted = false,
  }: {
    disabled?: boolean;
    selection: ArrangementTimeSelection;
    submitted?: boolean;
  } = $props();
</script>

<SettingsChoiceGroup
  label="Banetider"
  selectedValues={selection.selectedKeys}
  {disabled}
  onToggle={(key) => {
    if (!disabled) selection.toggle(key);
  }}
  options={selection.choices.map((slot) => ({
    value: arrangementSlotKey(slot),
    label: `${slot.slotStartTid.slice(0, 5)}–${slot.slotSluttTid.slice(0, 5)}${selection.availableKeys.has(arrangementSlotKey(slot)) ? "" : " · utilgjengelig"}`,
    disabled:
      !selection.availableKeys.has(arrangementSlotKey(slot)) &&
      !selection.selectedKeys.includes(arrangementSlotKey(slot)),
  }))}
/>
{#if selection.selectionError && (submitted || selection.staleSelection)}
  <Feedback tone="warning" title="Kontroller banetidene" description={selection.selectionError} />
{/if}
