import type {
  ArrangementKategori,
  KalenderSlotRespons,
  OpprettArrangementForespørsel,
} from "$lib/contracts";
import { dateTilUkedagIso, formaterArrangementKategori, isoTilDayOfWeek } from "$lib/domain";
import { arrangementSlotKey, canSelectArrangementSlot } from "./arrangement-slots";

export type QuickArrangementDraft = {
  description: string;
  category: ArrangementKategori;
};

export function quickArrangementRequest(
  activityId: string,
  draft: QuickArrangementDraft,
  slots: readonly KalenderSlotRespons[]
): OpprettArrangementForespørsel | null {
  const first = slots[0];
  if (
    !activityId ||
    !first ||
    slots.some(
      (slot) =>
        slot.baneId !== first.baneId || slot.dato !== first.dato || !canSelectArrangementSlot(slot)
    )
  )
    return null;

  const unique = [...new Map(slots.map((slot) => [arrangementSlotKey(slot), slot])).values()].sort(
    (left, right) => left.slotStartTid.localeCompare(right.slotStartTid)
  );
  return {
    grenId: activityId,
    tittel: formaterArrangementKategori(draft.category),
    beskrivelse: draft.description.trim() || undefined,
    kategori: draft.category,
    publisertPåNettsiden: false,
    startDato: first.dato,
    sluttDato: first.dato,
    ukedager: [isoTilDayOfWeek(dateTilUkedagIso(new Date(`${first.dato}T00:00:00`)))],
    baneGrupper: [
      { baneIder: [first.baneId], tidspunkter: unique.map((slot) => slot.slotStartTid) },
    ],
    eksplisitteSlots: unique.map((slot) => ({
      baneId: slot.baneId,
      dato: slot.dato,
      startTid: slot.slotStartTid,
      sluttTid: slot.slotSluttTid,
    })),
  };
}
