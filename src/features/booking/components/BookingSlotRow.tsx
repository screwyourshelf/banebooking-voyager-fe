import { memo } from "react";
import {
  RecordAccordionCard,
  RecordCard,
  RecordCardDetails,
  RecordCardStatic,
  RecordCardTrigger,
} from "@/components/records";
import { Button } from "@/components/ui/button";
import type { BookingSlotRespons } from "@/types";
import BookingSlotDetails from "./BookingSlotDetails";
import BookingSlotSummary from "./BookingSlotSummary";
import { getBookingSlotPresentation } from "./bookingSlotPresentation";

type Props = {
  slot: BookingSlotRespons;
  isAuthenticated: boolean;
  onBook?: (slot: BookingSlotRespons, arrangementId?: string) => void;
  onFjern?: (slot: BookingSlotRespons) => void;
};

function BookingSlotRow({ slot, isAuthenticated, onBook, onFjern }: Props) {
  const presentation = getBookingSlotPresentation(slot, isAuthenticated);
  const summary = <BookingSlotSummary slot={slot} presentation={presentation} />;
  const quickAction = presentation.kanHurtigbooke ? (
    <Button
      size="sm"
      onClick={() => onBook?.(slot)}
      aria-label={`Book tiden ${presentation.startTid} til ${presentation.sluttTid}`}
    >
      Book
    </Button>
  ) : null;

  if (!presentation.harDetaljer) {
    return (
      <RecordCard muted={slot.erPassert}>
        <RecordCardStatic action={quickAction}>{summary}</RecordCardStatic>
      </RecordCard>
    );
  }

  return (
    <RecordAccordionCard value={presentation.slotKey} muted={slot.erPassert}>
      <RecordCardTrigger action={quickAction}>{summary}</RecordCardTrigger>

      <RecordCardDetails>
        <BookingSlotDetails
          slot={slot}
          presentation={presentation}
          onBook={onBook}
          onFjern={onFjern}
        />
      </RecordCardDetails>
    </RecordAccordionCard>
  );
}

export default memo(BookingSlotRow);
