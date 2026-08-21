import type { BookingSlotRespons, SlotStatus } from "@/types";
import { erSlotBooket, utledSlotStatus } from "@/utils/bookingUtils";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";

export type BookingSlotPresentation = {
  slotKey: string;
  startTid: string;
  sluttTid: string;
  status: SlotStatus;
  tittel: string | null;
  statusTekst: string;
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
  const harOffentligArrangementBeskrivelse = Boolean(slot.arrangementBeskrivelse?.trim());
  const harArrangementBooker = harArrangement && Boolean(slot.booketAv?.trim());
  const erBooket = erSlotBooket(slot);
  const status = utledSlotStatus(slot, erInnlogget);
  const kanKobleTilArrangement = kan(Kapabiliteter.booking.kobleTilArrangement);
  const kanFjerne = kan(Kapabiliteter.booking.fjern);
  const kanIkkeBooke =
    erInnlogget &&
    !slot.erPassert &&
    !erBooket &&
    !harArrangement &&
    !kan(Kapabiliteter.booking.book);
  const harDetaljer =
    harOffentligArrangementBeskrivelse ||
    harArrangementBooker ||
    (erInnlogget && (kanKobleTilArrangement || kanFjerne || kanIkkeBooke));

  return {
    slotKey: getBookingSlotKey(slot),
    startTid: effektivStart.slice(0, 5),
    sluttTid: effektivSlutt.slice(0, 5),
    status,
    tittel: getTitle(slot, status),
    statusTekst: getStatusText(status),
    harDetaljer,
    kanHurtigbooke: erInnlogget && !slot.erPassert && kan(Kapabiliteter.booking.book),
    kanIkkeBooke,
    kanKobleTilArrangement,
    kanFjerne,
  };
}

export function getBookingSlotKey(slot: BookingSlotRespons) {
  return slot.bookingId ?? `${slot.dato}-${slot.slotStartTid}-${slot.baneId}`;
}

function getStatusText(status: SlotStatus) {
  if (status === "passert") return "Passert";
  return status === "ledig" ? "Ledig" : "Opptatt";
}

function getTitle(slot: BookingSlotRespons, status: SlotStatus) {
  if (slot.arrangementTittel) return slot.arrangementTittel;
  if (slot.erEier === true) return "Din tid";
  if (status === "ledig") return null;
  return slot.booketAv?.trim() || "Booket";
}
