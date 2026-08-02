import { RefreshCw } from "lucide-react";
import { ServerFeil } from "@/components/errors";
import { RecordListState } from "@/components/records";
import { Button } from "@/components/ui/button";
import {
  BookingCourtSwitcher,
  BookingPrimaryControls,
  BookingSlotListAccordion,
} from "@/features/booking/components";
import { utledSlotStatus } from "@/utils/bookingUtils";
import type { BaneRespons, GrenRespons, KalenderSlotRespons } from "@/types";
import type { BookingContentProps, BookingResultProps } from "./bookingViewTypes";

type Props = BookingContentProps & {
  valgtGren?: GrenRespons;
};

type HeaderProps = Pick<
  Props,
  | "grener"
  | "valgtGrenId"
  | "onGrenChange"
  | "baner"
  | "valgtBaneId"
  | "onBaneChange"
  | "valgtDato"
  | "onDatoChange"
  | "isLoading"
  | "isFetching"
> & {
  ledigeAntall: number;
};

type BodyProps = BookingResultProps & {
  baner: BaneRespons[];
  valgtGren?: GrenRespons;
  valgtDato: Date | null;
};

export default function BookingSchedule(props: Props) {
  const ledigeAntall = getLedigeAntall(props.slots, props.isAuthenticated);

  return (
    <section className="booking-schedule" aria-label="Tilgjengelige tider">
      <BookingScheduleHeader {...props} ledigeAntall={ledigeAntall} />
      <BookingScheduleBody {...props} />
    </section>
  );
}

function BookingScheduleHeader({
  grener,
  valgtGrenId,
  onGrenChange,
  baner,
  valgtBaneId,
  onBaneChange,
  valgtDato,
  onDatoChange,
  isLoading,
  isFetching,
  ledigeAntall,
}: HeaderProps) {
  return (
    <header className="control-surface booking-schedule__header">
      <BookingPrimaryControls
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
        ledigeAntall={baner.length > 0 && !isLoading && !isFetching ? ledigeAntall : undefined}
      />
    </header>
  );
}

function BookingScheduleBody({
  baner,
  valgtGren,
  valgtDato,
  slots,
  isLoading,
  isFetching,
  isSetupFetching,
  isAuthenticated,
  onBook,
  onFjern,
  setupFeil,
  queryFeil,
  bookFeil,
  fjernFeil,
  onSetupRetry,
  onSlotsRetry,
}: BodyProps) {
  return (
    <div className="booking-schedule__body">
      <BookingMutationErrors bookFeil={bookFeil} fjernFeil={fjernFeil} />

      {setupFeil ? (
        <BookingLoadError
          title="Kunne ikke laste bookingoppsettet"
          description={setupFeil}
          isFetching={isSetupFetching}
          onRetry={onSetupRetry}
        />
      ) : queryFeil ? (
        <BookingLoadError
          title="Kunne ikke laste tidene"
          description={queryFeil}
          isFetching={isFetching}
          onRetry={onSlotsRetry}
        />
      ) : baner.length === 0 ? (
        <BookingEmptyState grenNavn={valgtGren?.navn} />
      ) : (
        <div className={isFetching && !isLoading ? "booking-schedule__loading" : undefined}>
          <BookingSlotListAccordion
            slots={slots}
            valgtDato={valgtDato}
            isAuthenticated={isAuthenticated}
            onBook={onBook}
            onFjern={onFjern}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}

function BookingLoadError({
  title,
  description,
  isFetching,
  onRetry,
}: {
  title: string;
  description: string;
  isFetching: boolean;
  onRetry: () => void;
}) {
  return (
    <RecordListState
      icon={<RefreshCw aria-hidden="true" />}
      title={title}
      description={description}
      tone="danger"
      role="alert"
      action={
        <Button type="button" variant="outline" size="sm" onClick={onRetry} disabled={isFetching}>
          {isFetching ? "Prøver igjen…" : "Prøv igjen"}
        </Button>
      }
    />
  );
}

function BookingMutationErrors({
  bookFeil,
  fjernFeil,
}: Pick<BookingResultProps, "bookFeil" | "fjernFeil">) {
  if (!bookFeil && !fjernFeil) return null;

  return (
    <div className="booking-schedule__feedback">
      <ServerFeil feil={bookFeil} title="Tiden kunne ikke bookes" />
      <ServerFeil feil={fjernFeil} title="Tiden kunne ikke avbestilles" />
    </div>
  );
}

function BookingEmptyState({ grenNavn }: { grenNavn?: string }) {
  return (
    <div className="booking-slot__empty" role="status">
      <div className="booking-slot__empty-title">Ingen baner å vise</div>
      <p className="booking-slot__empty-copy">
        Det er ikke lagt til baner for {grenNavn ?? "denne grenen"}.
      </p>
    </div>
  );
}

function getLedigeAntall(slots: KalenderSlotRespons[], erInnlogget: boolean) {
  return slots.filter((slot) => !slot.erPassert && utledSlotStatus(slot, erInnlogget) === "ledig")
    .length;
}
