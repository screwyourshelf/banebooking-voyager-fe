import {
  BookingCourtSwitcher,
  BookingDateNavigator,
  BookingFilters,
  BookingMobileControls,
  BookingSlotListAccordion,
} from "@/features/booking/components";
import { ServerFeil } from "@/components/errors";
import { PageHeader } from "@/components/layout";
import { FeedNotice } from "@/features/feed/components";
import { resolveBookingActivityTheme } from "@/features/booking/activityTheme";
import { utledSlotStatus } from "@/utils/bookingUtils";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

import type { KalenderSlotRespons, BaneRespons, GrenRespons } from "@/types";
import type { AuthenticatedUser } from "@/auth/authTypes";

type Props = {
  grener: GrenRespons[];
  valgtGrenId: string;
  onGrenChange: (grenId: string) => void;

  baner: BaneRespons[];
  valgtBaneId: string;
  onBaneChange: (baneId: string) => void;

  valgtDato: Date | null;
  onDatoChange: (dato: Date | null) => void;

  slots: KalenderSlotRespons[];
  isLoading: boolean;
  isFetching: boolean;

  currentUser: AuthenticatedUser | null;

  onBook: (slot: KalenderSlotRespons) => void;
  onFjern: (slot: KalenderSlotRespons) => void;
  serverFeil: string | null;
};

export default function BookingContent({
  grener,
  valgtGrenId,
  onGrenChange,
  baner,
  valgtBaneId,
  onBaneChange,
  valgtDato,
  onDatoChange,
  slots,
  isLoading,
  isFetching,
  currentUser,
  onBook,
  onFjern,
  serverFeil,
}: Props) {
  const valgtGren = grener.find((gren) => gren.id === valgtGrenId);
  const valgtBane = baner.find((bane) => bane.id === valgtBaneId);
  const activityTheme = resolveBookingActivityTheme(valgtGren?.slug);
  const datoTekst = valgtDato
    ? format(valgtDato, "EEEE d. MMMM", { locale: nb })
    : "Ingen dato valgt";
  const ledigeAntall = slots.filter(
    (slot) => !slot.erPassert && utledSlotStatus(slot, !!currentUser) === "ledig"
  ).length;

  return (
    <div className="booking-page" data-activity-theme={activityTheme}>
      <PageHeader
        className="booking-page__heading"
        eyebrow="Booking"
        title="Book bane"
        description="Finn en ledig tid."
      />

      <FeedNotice />

      <div className="booking-workspace">
        <section className="booking-controls" aria-label="Velg dag, aktivitet og bane">
          <div className="booking-control-section booking-control-section--date">
            <div className="booking-control-section__heading">
              <span>1 · Dag</span>
              <strong>Velg når du vil spille</strong>
            </div>

            <BookingDateNavigator
              value={valgtDato}
              onChange={(date) => onDatoChange(date ?? null)}
            />
          </div>

          <div className="booking-control-section booking-control-section--filters">
            <div className="booking-control-section__heading">
              <span>2 · Bane</span>
              <strong>Velg aktivitet og bane</strong>
            </div>

            <BookingFilters
              grener={grener}
              valgtGrenId={valgtGrenId}
              onGrenChange={onGrenChange}
              baner={baner}
              valgtBaneId={valgtBaneId}
              onBaneChange={onBaneChange}
            />
          </div>
        </section>

        <section className="booking-schedule" aria-label="Tilgjengelige tider">
          <header className="control-surface booking-schedule__header">
            <div className="booking-schedule__summary">
              <div className="booking-schedule__eyebrow">3 · Tidspunkt</div>
              <h2 className="booking-schedule__title booking-schedule__title--desktop">
                {valgtBane?.navn ?? valgtGren?.navn ?? "Baner"}
              </h2>
              <p className="booking-schedule__meta">
                <span className="booking-schedule__meta-activity">
                  {valgtGren?.navn ? `${valgtGren.navn} · ` : null}
                </span>
                {datoTekst}
              </p>
            </div>

            <div className="booking-schedule__actions">
              {baner.length > 0 && !isLoading ? (
                <div className="booking-schedule__count" data-empty={ledigeAntall === 0}>
                  {ledigeAntall === 0 ? "Ingen ledige" : `${ledigeAntall} ledige`}
                </div>
              ) : null}
            </div>

            <BookingMobileControls
              grener={grener}
              valgtGrenId={valgtGrenId}
              onGrenChange={onGrenChange}
              valgtDato={valgtDato}
              onDatoChange={onDatoChange}
            />

            <BookingCourtSwitcher
              baner={baner}
              valgtBaneId={valgtBaneId}
              onBaneChange={onBaneChange}
              ledigeAntall={
                baner.length > 0 && !isLoading && !isFetching ? ledigeAntall : undefined
              }
            />
          </header>

          <div className="booking-schedule__columns" aria-hidden="true">
            <span>Tid</span>
            <span>Tilgjengelighet</span>
            <span>Vær</span>
          </div>

          <div className="booking-schedule__body">
            <ServerFeil feil={serverFeil} />

            {baner.length === 0 ? (
              <div className="booking-slot__empty" role="status">
                <div className="booking-slot__empty-title">Ingen baner å vise</div>
                <p className="booking-slot__empty-copy">
                  Det er ikke lagt til baner for {valgtGren?.navn ?? "denne aktiviteten"}.
                </p>
              </div>
            ) : (
              <div className={isFetching && !isLoading ? "booking-schedule__loading" : undefined}>
                <BookingSlotListAccordion
                  slots={slots}
                  valgtDato={valgtDato}
                  currentUser={currentUser ? { epost: currentUser.email ?? "" } : null}
                  onBook={onBook}
                  onFjern={onFjern}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
