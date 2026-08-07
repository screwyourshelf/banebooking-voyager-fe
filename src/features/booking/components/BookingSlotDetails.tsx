import { Button } from "@/components/ui/button";
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
    <div className="space-y-4 border-t pt-4">
      {slot.arrangementBeskrivelse ? (
        <p className="max-w-3xl leading-relaxed text-muted-foreground">
          {slot.arrangementBeskrivelse}
        </p>
      ) : null}

      {arrangementBooker ? (
        <dl className="grid gap-1 text-sm sm:grid-cols-[7rem_1fr]">
          <dt className="text-muted-foreground">Booket av</dt>
          <dd className="font-medium">{arrangementBooker}</dd>
        </dl>
      ) : null}

      {presentation.kanIkkeBooke ? (
        <p className="text-sm text-muted-foreground">
          Du kan ikke booke denne tiden akkurat nå. Maks antall bookinger kan være nådd.
        </p>
      ) : null}

      {presentation.kanKobleTilArrangement || presentation.kanFjerne ? (
        <div className="flex flex-wrap justify-end gap-2 pt-1">
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
        </div>
      ) : null}
    </div>
  );
}
