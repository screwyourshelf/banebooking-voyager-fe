import { Button } from "@/components/ui/button";
import { Stack, Text } from "@/components/layout";
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
    <Stack gap="lg">
      {slot.arrangementBeskrivelse ? (
        <Text variant="muted">{slot.arrangementBeskrivelse}</Text>
      ) : null}

      {arrangementBooker ? (
        <RecordFacts items={[{ label: "Booket av", value: arrangementBooker }]} />
      ) : null}

      {presentation.kanIkkeBooke ? (
        <Text variant="muted">
          Du kan ikke booke denne tiden akkurat nå. Maks antall bookinger kan være nådd.
        </Text>
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
    </Stack>
  );
}
