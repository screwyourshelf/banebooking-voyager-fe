import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Stack, Inline } from "@/components/layout";
import WeatherInfo from "@/components/WeatherInfo";
import { Button } from "@/components/ui/button";
import SlotListSkeleton from "@/components/loading/SlotListSkeleton";
import KobleTilArrangementDialog from "./KobleTilArrangementDialog";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";
import { grupperSlots, utledSlotStatus, utledSlotVisning } from "@/utils/bookingUtils";
import type { BookingSlotRespons } from "@/types";

type Props = {
  slots: BookingSlotRespons[];
  valgtDato: Date | null;
  currentUser: { epost: string } | null;
  onBook?: (slot: BookingSlotRespons, arrangementId?: string) => void;
  onFjern?: (slot: BookingSlotRespons) => void;
  isLoading?: boolean;
};

type SlotRowProps = Pick<Props, "currentUser" | "onBook" | "onFjern"> & {
  slot: BookingSlotRespons;
};

function BookingSlotRow({ slot, currentUser, onBook, onFjern }: SlotRowProps) {
  const slotKey = slot.bookingId ?? `${slot.dato}-${slot.slotStartTid}-${slot.baneId}`;
  const effektivStart = slot.bookingStartTid ?? slot.slotStartTid;
  const effektivSlutt = slot.bookingSluttTid ?? slot.slotSluttTid;
  const startTid = effektivStart.slice(0, 5);
  const sluttTid = effektivSlutt.slice(0, 5);

  const harArrangement = !!slot.arrangementTittel;
  const kan = (handling: string) => harHandling(slot.kapabiliteter, handling);
  const erBooket = !!slot.booketAv || kan(Kapabiliteter.booking.fjern);
  const erInnlogget = !!currentUser;
  const status = utledSlotStatus(slot, erInnlogget);
  const { tekst: statusTekst } = utledSlotVisning(slot, erInnlogget);
  const kanHurtigbooke = erInnlogget && !slot.erPassert && kan(Kapabiliteter.booking.book);

  const kanIkkeBooke =
    erInnlogget &&
    !slot.erPassert &&
    !erBooket &&
    !harArrangement &&
    !kan(Kapabiliteter.booking.book);

  const kanKobleTilArrangement = kan(Kapabiliteter.booking.kobleTilArrangement);
  const kanFjerne = kan(Kapabiliteter.booking.fjern);
  const harHandlinger = erInnlogget && (kanKobleTilArrangement || kanFjerne);
  const harDetaljer = harHandlinger;

  const desktopHovedtekst = harArrangement
    ? slot.arrangementTittel
    : status === "din_booking"
      ? "Din reservasjon"
      : slot.booketAv
        ? slot.booketAv
        : statusTekst;

  const mobilHovedtekst =
    slot.erPassert || status === "passert" ? "Passert" : status === "ledig" ? "Ledig" : "Opptatt";

  const mobilSekundærtekst = harArrangement
    ? slot.arrangementTittel
    : erInnlogget && slot.erEier === true
      ? "Din reservasjon"
      : slot.booketAv;

  const visEgenStatus = harArrangement || !!slot.booketAv || status === "din_booking";

  const oppsummering = (
    <>
      <div className="booking-slot__summary booking-slot__summary--mobile">
        <div className="booking-slot__time booking-slot__time--mobile">
          <strong>{startTid}</strong>
          <span className="sr-only">til {sluttTid}</span>
          {slot.værSymbol || typeof slot.temperatur === "number" ? (
            <span className="booking-slot__time-weather">
              <WeatherInfo
                værSymbol={slot.værSymbol}
                temperatur={slot.temperatur}
                vind={slot.vind}
                compact
              />
            </span>
          ) : null}
        </div>

        <div className="booking-slot__mobile-content">
          <span className="booking-slot__mobile-primary">{mobilHovedtekst}</span>
          {mobilSekundærtekst ? (
            <span className="booking-slot__mobile-secondary" title={mobilSekundærtekst}>
              {mobilSekundærtekst}
            </span>
          ) : null}
        </div>
      </div>

      <div className="booking-slot__summary booking-slot__summary--desktop">
        <div className="booking-slot__time">
          <strong>{startTid}</strong>
          <span>– {sluttTid}</span>
        </div>

        <div className="booking-slot__identity">
          <span className="booking-slot__name">{desktopHovedtekst}</span>
          {harArrangement && slot.arrangementBeskrivelse ? (
            <span className="booking-slot__secondary" title={slot.arrangementBeskrivelse}>
              {harDetaljer ? "Se detaljer" : slot.arrangementBeskrivelse}
            </span>
          ) : null}
        </div>

        <div className="booking-slot__meta">
          <span className="booking-slot__status" data-status={status} data-hidden={!visEgenStatus}>
            {statusTekst}
          </span>

          <span className="booking-slot__weather booking-slot__weather--desktop">
            <WeatherInfo værSymbol={slot.værSymbol} temperatur={slot.temperatur} vind={slot.vind} />
          </span>
        </div>
      </div>
    </>
  );

  const hurtighandling = kanHurtigbooke ? (
    <Button
      size="sm"
      className="booking-slot__quick-action"
      onClick={() => onBook?.(slot)}
      aria-label={`Book tiden ${startTid} til ${sluttTid}`}
    >
      Book
    </Button>
  ) : null;

  if (!harDetaljer) {
    return (
      <div className="record-card booking-slot" data-past={slot.erPassert} data-status={status}>
        <div className="booking-slot__row">
          <div className="booking-slot__trigger booking-slot__trigger--static">{oppsummering}</div>
          {hurtighandling}
        </div>
      </div>
    );
  }

  return (
    <AccordionItem
      value={slotKey}
      className="record-card booking-slot"
      data-past={slot.erPassert}
      data-status={status}
    >
      <div className="booking-slot__row">
        <AccordionTrigger className="booking-slot__trigger hover:no-underline">
          {oppsummering}
        </AccordionTrigger>
        {hurtighandling}
      </div>

      <AccordionContent className="booking-slot__details">
        <Stack gap="sm">
          {slot.arrangementBeskrivelse ? (
            <p className="booking-slot__description whitespace-pre-wrap">
              {slot.arrangementBeskrivelse}
            </p>
          ) : null}

          {kanIkkeBooke ? (
            <p className="booking-slot__description">
              Du kan ikke booke denne tiden akkurat nå. Maks antall bookinger kan være nådd.
            </p>
          ) : null}

          {harHandlinger ? (
            <div className="booking-slot__actions">
              {kanKobleTilArrangement ? (
                <KobleTilArrangementDialog
                  valgtId={null}
                  onVelg={(id) => {
                    if (id) onBook?.(slot, id);
                  }}
                >
                  <Button variant="outline" size="sm" className="booking-slot__detail-action">
                    Koble til arrangement
                  </Button>
                </KobleTilArrangementDialog>
              ) : null}

              {kanFjerne ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onFjern?.(slot)}
                  className="booking-slot__detail-action"
                >
                  Avbestill
                </Button>
              ) : null}
            </div>
          ) : null}
        </Stack>
      </AccordionContent>
    </AccordionItem>
  );
}

export function BookingSlotListAccordion({
  slots,
  valgtDato,
  currentUser,
  onBook,
  onFjern,
  isLoading = false,
}: Props) {
  const idag = new Date(new Date().toDateString());
  const erHistorisk = valgtDato != null && valgtDato < idag;
  const erIDag = valgtDato != null && valgtDato.toDateString() === idag.toDateString();

  const synligeSlots = grupperSlots(slots);
  const passerte = synligeSlots.filter((s) => s.erPassert);
  const kommende = synligeSlots.filter((s) => !s.erPassert);

  const [visPasserte, setVisPasserte] = useState(erHistorisk);

  if (isLoading) return <SlotListSkeleton />;

  if (slots.length === 0) {
    return (
      <div className="booking-slot__empty" role="status">
        <div className="booking-slot__empty-title">Ingen tider denne dagen</div>
        <p className="booking-slot__empty-copy">Prøv en annen dato eller bane.</p>
      </div>
    );
  }

  const slotsÅVise = erIDag && !visPasserte ? kommende : synligeSlots;

  return (
    <>
      {slotsÅVise.length === 0 ? (
        <div className="booking-slot__empty" role="status">
          <div className="booking-slot__empty-title">Dagens spilletider er over</div>
          <p className="booking-slot__empty-copy">Vis passerte tider eller velg neste dag.</p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="record-list booking-slot-list">
          {slotsÅVise.map((slot) => (
            <BookingSlotRow
              key={slot.bookingId ?? `${slot.dato}-${slot.slotStartTid}-${slot.baneId}`}
              slot={slot}
              currentUser={currentUser}
              onBook={onBook}
              onFjern={onFjern}
            />
          ))}
        </Accordion>
      )}

      {erIDag && passerte.length > 0 && (
        <Inline justify="center" className="booking-slot-list__past-toggle">
          <Button variant="outline" size="sm" onClick={() => setVisPasserte((v) => !v)}>
            {visPasserte ? "Skjul passerte" : `Vis passerte (${passerte.length})`}
          </Button>
        </Inline>
      )}
    </>
  );
}
