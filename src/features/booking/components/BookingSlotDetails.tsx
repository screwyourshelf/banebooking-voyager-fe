import { Stack } from "@/components/layout";
import { RecordCardActions } from "@/components/records";
import { Button } from "@/components/ui/button";
import type { BookingSlotRespons } from "@/types";
import type { BookingSlotPresentation } from "./bookingSlotPresentation";
import KobleTilArrangementDialog from "./KobleTilArrangementDialog";

type Props = {
  slot: BookingSlotRespons;
  presentation: BookingSlotPresentation;
  onBook?: (slot: BookingSlotRespons, arrangementId?: string) => void;
  onFjern?: (slot: BookingSlotRespons) => void;
};

export default function BookingSlotDetails({ slot, presentation, onBook, onFjern }: Props) {
  return (
    <Stack gap="sm">
      {slot.arrangementBeskrivelse ? (
        <p className="booking-slot__description">{slot.arrangementBeskrivelse}</p>
      ) : null}

      {presentation.kanIkkeBooke ? (
        <p className="booking-slot__description">
          Du kan ikke booke denne tiden akkurat nå. Maks antall bookinger kan være nådd.
        </p>
      ) : null}

      {presentation.kanKobleTilArrangement || presentation.kanFjerne ? (
        <RecordCardActions>
          {presentation.kanKobleTilArrangement ? (
            <KobleTilArrangementDialog
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
    </Stack>
  );
}
