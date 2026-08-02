import type { BookingSlotRespons, SlotStatus } from "@/types";
import { utledSlotStatus } from "@/utils/bookingUtils";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";

export type BookingSlotPresentation = {
  slotKey: string;
  startTid: string;
  sluttTid: string;
  status: SlotStatus;
  hovedtekst: string;
  sekundærtekst?: string;
  harDetaljer: boolean;
  kanHurtigbooke: boolean;
  kanIkkeBooke: boolean;
  kanKobleTilArrangement: boolean;
  kanFjerne: boolean;
};

export function getBookingSlotPresentation(
  slot: BookingSlotRespons,
  erInnlogget: boolean
): BookingSlotPresentation {
  const kan = (handling: string) => harHandling(slot.kapabiliteter, handling);
  const effektivStart = slot.bookingStartTid ?? slot.slotStartTid;
  const effektivSlutt = slot.bookingSluttTid ?? slot.slotSluttTid;
  const harArrangement = Boolean(slot.arrangementTittel);
  const erBooket = Boolean(slot.booketAv) || kan(Kapabiliteter.booking.fjern);
  const status = utledSlotStatus(slot, erInnlogget);
  const kanKobleTilArrangement = kan(Kapabiliteter.booking.kobleTilArrangement);
  const kanFjerne = kan(Kapabiliteter.booking.fjern);
  const harDetaljer = erInnlogget && (kanKobleTilArrangement || kanFjerne);

  return {
    slotKey: getBookingSlotKey(slot),
    startTid: effektivStart.slice(0, 5),
    sluttTid: effektivSlutt.slice(0, 5),
    status,
    hovedtekst: getPrimaryText(slot, status),
    sekundærtekst: getSecondaryText(slot, erInnlogget),
    harDetaljer,
    kanHurtigbooke: erInnlogget && !slot.erPassert && kan(Kapabiliteter.booking.book),
    kanIkkeBooke:
      erInnlogget &&
      !slot.erPassert &&
      !erBooket &&
      !harArrangement &&
      !kan(Kapabiliteter.booking.book),
    kanKobleTilArrangement,
    kanFjerne,
  };
}

export function getBookingSlotKey(slot: BookingSlotRespons) {
  return slot.bookingId ?? `${slot.dato}-${slot.slotStartTid}-${slot.baneId}`;
}

function getPrimaryText(slot: BookingSlotRespons, status: SlotStatus) {
  if (slot.erPassert || status === "passert") return "Passert";
  return status === "ledig" ? "Ledig" : "Opptatt";
}

function getSecondaryText(slot: BookingSlotRespons, erInnlogget: boolean) {
  if (slot.arrangementTittel) return slot.arrangementTittel;
  if (erInnlogget && slot.erEier === true) return "Din tid";
  return slot.booketAv ?? undefined;
}
