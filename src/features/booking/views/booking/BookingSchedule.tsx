import { AlertCircle, CalendarX, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const valgtBane = props.baner.find((bane) => bane.id === props.valgtBaneId);

  return (
    <div className="space-y-6" aria-busy={props.isLoading || props.isFetching || undefined}>
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

      <Card className="md:bg-card/95 md:backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Tilgjengelige tider</CardTitle>
          <CardDescription>
            {valgtBane
              ? `${valgtBane.navn}${props.valgtGren ? ` · ${props.valgtGren.navn}` : ""}`
              : "Velg en bane for å se tider."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookingScheduleBody {...props} />
        </CardContent>
      </Card>
    </div>
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
    <div className="space-y-4">
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
        <div className={isFetching && !isLoading ? "opacity-60 transition-opacity" : undefined}>
          <BookingSlotListAccordion
            grenId={valgtGrenId}
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
    <Alert variant="destructive">
      <AlertCircle aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>{description}</span>
        <Button type="button" variant="outline" size="sm" onClick={onRetry} disabled={isFetching}>
          <RefreshCw className={isFetching ? "animate-spin" : undefined} aria-hidden="true" />
          {isFetching ? "Prøver igjen…" : "Prøv igjen"}
        </Button>
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
    <div
      className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-12 text-center"
      role="status"
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-muted">
        <CalendarX className="size-5 text-muted-foreground" aria-hidden="true" />
      </span>
      <p className="font-medium">Ingen baner å vise</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Det er ikke lagt til baner for {grenNavn ?? "denne grenen"}.
      </p>
    </div>
  );
}

function getLedigeAntall(slots: KalenderSlotRespons[], erInnlogget: boolean) {
  return slots.filter((slot) => !slot.erPassert && utledSlotStatus(slot, erInnlogget) === "ledig")
    .length;
}
