import { untrack } from "svelte";
import { SvelteMap, SvelteSet } from "svelte/reactivity";
import type { KalenderSlotRespons } from "#lib/contracts/index.ts";
import { arrangementSlotKey, canSelectArrangementSlot } from "./arrangement-slots";

export type ArrangementTimeSelection = ReturnType<typeof createArrangementTimeSelection>;

export function createArrangementTimeSelection(
  initialSlot: KalenderSlotRespons,
  getSlots: () => readonly KalenderSlotRespons[]
) {
  function availableSlots() {
    return getSlots().filter(
      (slot) =>
        slot.baneId === initialSlot.baneId &&
        slot.dato === initialSlot.dato &&
        canSelectArrangementSlot(slot)
    );
  }

  const initialChoices = untrack(availableSlots);
  let selected = $state([initialSlot]);
  const selectedKeys = $derived(selected.map(arrangementSlotKey));
  const available = $derived(availableSlots());
  const availableKeys = $derived(new SvelteSet(available.map(arrangementSlotKey)));
  const choices = $derived(
    [
      ...new SvelteMap(
        [...initialChoices, ...available, ...selected].map((slot) => [
          arrangementSlotKey(slot),
          slot,
        ])
      ).values(),
    ].sort((left, right) => left.slotStartTid.localeCompare(right.slotStartTid))
  );
  const selectedSlots = $derived(
    available.filter((slot) => selectedKeys.includes(arrangementSlotKey(slot)))
  );
  const staleSelection = $derived(selectedSlots.length !== selectedKeys.length);
  const selectionError = $derived(
    staleSelection
      ? "En valgt tid er ikke lenger tilgjengelig. Fjern den og velg en annen tid."
      : selectedKeys.length === 0
        ? "Velg minst én banetid."
        : null
  );

  return {
    get choices() {
      return choices;
    },
    get availableKeys() {
      return availableKeys;
    },
    get selectedKeys() {
      return selectedKeys;
    },
    get selectedSlots() {
      return selectedSlots;
    },
    get staleSelection() {
      return staleSelection;
    },
    get selectionError() {
      return selectionError;
    },
    toggle(key: string) {
      const next = available.find((slot) => arrangementSlotKey(slot) === key);
      selected = selectedKeys.includes(key)
        ? selected.filter((slot) => arrangementSlotKey(slot) !== key)
        : next
          ? [...selected, next]
          : selected;
    },
  };
}
