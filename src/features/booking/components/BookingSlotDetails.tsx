import { Button } from "@/components/ui/button";
import { RecordCardActions, RecordFacts } from "@/components/records";
import type { BookingSlotRespons } from "@/types";
import type { BookingSlotPresentation } from "./bookingSlotPresentation";
import KobleTilArrangementDialog from "./KobleTilArrangementDialog";

type Props = {
  grenId: string;
  slot: BookingSlotRespons;
  presentation: BookingSlotPresentation;
  onBook?: (slot: BookingSlotRespons, arrangementId?: string) => void;
  onFjern?: (slot: BookingSlotRespons) => void;
};

export default function BookingSlotDetails({ grenId, slot, presentation, onBook, onFjern }: Props) {
  const arrangementBooker = slot.arrangementTittel ? slot.booketAv?.trim() : null;

  return (
    <div className="space-y-4">
      {slot.arrangementBeskrivelse ? (
        <p className="max-w-3xl leading-relaxed text-muted-foreground">
          {slot.arrangementBeskrivelse}
        </p>
      ) : null}

      {arrangementBooker ? (
        <RecordFacts items={[{ label: "Booket av", value: arrangementBooker }]} />
      ) : null}

      {presentation.kanIkkeBooke ? (
        <p className="text-sm text-muted-foreground">
          Du kan ikke booke denne tiden akkurat nå. Maks antall bookinger kan være nådd.
        </p>
      ) : null}

      {presentation.kanKobleTilArrangement || presentation.kanFjerne ? (
        <RecordCardActions>
          {presentation.kanKobleTilArrangement ? (
            <KobleTilArrangementDialog
              grenId={grenId}
              valgtId={null}
              onVelg={(arrangementId) => {
                if (arrangementId) onBook?.(slot, arrangementId);
              }}
            >
              <Button variant="outline" size="sm">
                Koble til arrangement
              </Button>
            </KobleTilArrangementDialog>
          ) : null}

          {presentation.kanFjerne ? (
            <Button variant="destructive" size="sm" onClick={() => onFjern?.(slot)}>
              Avbestill
            </Button>
          ) : null}
        </RecordCardActions>
      ) : null}
    </div>
  );
}
