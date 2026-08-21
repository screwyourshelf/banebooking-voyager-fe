import { AlertCircle, CalendarX, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Inline, Stack } from "@/components/layout";
import { RecordCollection, RecordCollectionBody, RecordListState } from "@/components/records";
import { BookingSelectionHeader, BookingSlotListAccordion } from "@/features/booking/components";
import { utledSlotStatus } from "@/utils/bookingUtils";
import type { BaneRespons, GrenRespons, KalenderSlotRespons } from "@/types";
import type { BookingContentProps, BookingResultProps } from "./bookingViewTypes";

type Props = BookingContentProps & {
  valgtGren?: GrenRespons;
};

type BodyProps = BookingResultProps & {
  baner: BaneRespons[];
  valgtGrenId: string;
  valgtGren?: GrenRespons;
  valgtDato: Date | null;
};

export default function BookingSchedule(props: Props) {
  const ledigeAntall = getLedigeAntall(props.slots, props.isAuthenticated);

  return (
    <RecordCollection ariaLabel="Tilgjengelige tider" busy={props.isLoading || props.isFetching}>
      <BookingSelectionHeader
        grener={props.grener}
        valgtGrenId={props.valgtGrenId}
        onGrenChange={props.onGrenChange}
        baner={props.baner}
        valgtBaneId={props.valgtBaneId}
        onBaneChange={props.onBaneChange}
        valgtDato={props.valgtDato}
        onDatoChange={props.onDatoChange}
        ledigeAntall={ledigeAntall}
        isLoading={props.isLoading}
        isFetching={props.isFetching}
        isSetupFetching={props.isSetupFetching}
        hasError={Boolean(props.setupFeil || props.queryFeil)}
      />

      <RecordCollectionBody>
        <BookingScheduleBody {...props} />
      </RecordCollectionBody>
    </RecordCollection>
  );
}

function BookingScheduleBody({
  baner,
  valgtGrenId,
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
    <>
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
        <BookingSlotListAccordion
          grenId={valgtGrenId}
          slots={slots}
          valgtDato={valgtDato}
          isAuthenticated={isAuthenticated}
          onBook={onBook}
          onFjern={onFjern}
          isLoading={isLoading}
          isFetching={isFetching}
        />
      )}
    </>
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
    <Alert variant="destructive">
      <AlertCircle aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <Stack gap="sm">
          <span>{description}</span>
          <Inline>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isFetching}
            >
              <RefreshCw aria-hidden="true" />
              {isFetching ? "Prøver igjen…" : "Prøv igjen"}
            </Button>
          </Inline>
        </Stack>
      </AlertDescription>
    </Alert>
  );
}

function BookingMutationErrors({
  bookFeil,
  fjernFeil,
}: Pick<BookingResultProps, "bookFeil" | "fjernFeil">) {
  const message = bookFeil ?? fjernFeil;
  if (!message) return null;

  return (
    <Alert variant="destructive">
      <AlertCircle aria-hidden="true" />
      <AlertTitle>
        {bookFeil ? "Tiden kunne ikke bookes" : "Tiden kunne ikke avbestilles"}
      </AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

function BookingEmptyState({ grenNavn }: { grenNavn?: string }) {
  return (
    <RecordListState
      icon={<CalendarX aria-hidden="true" />}
      title="Ingen baner å vise"
      description={`Det er ikke lagt til baner for ${grenNavn ?? "denne grenen"}.`}
    />
  );
}

function getLedigeAntall(slots: KalenderSlotRespons[], erInnlogget: boolean) {
  return slots.filter((slot) => !slot.erPassert && utledSlotStatus(slot, erInnlogget) === "ledig")
    .length;
}
