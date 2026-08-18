import { memo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { BookingSlotRespons } from "@/types";
import { bookingSlotStyles } from "@/styles/recipes";
import BookingSlotDetails from "./BookingSlotDetails";
import BookingSlotSummary from "./BookingSlotSummary";
import { getBookingSlotPresentation } from "./bookingSlotPresentation";

type Props = {
  grenId: string;
  slot: BookingSlotRespons;
  isAuthenticated: boolean;
  onBook?: (slot: BookingSlotRespons, arrangementId?: string) => void;
  onFjern?: (slot: BookingSlotRespons) => void;
};

function BookingSlotRow({ grenId, slot, isAuthenticated, onBook, onFjern }: Props) {
  const presentation = getBookingSlotPresentation(slot, isAuthenticated);
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
      <Card size="sm" className={slot.erPassert ? "opacity-60" : undefined}>
        <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <BookingSlotSummary slot={slot} presentation={presentation} />
          {quickAction}
        </CardContent>
      </Card>
    );
  }

  return (
    <Accordion type="single" collapsible className={slot.erPassert ? "opacity-60" : undefined}>
      <AccordionItem value={presentation.slotKey}>
        <div className={bookingSlotStyles.row}>
          <AccordionTrigger className={bookingSlotStyles.trigger}>
            <BookingSlotSummary slot={slot} presentation={presentation} />
          </AccordionTrigger>
          {quickAction}
        </div>
        <AccordionContent>
          <BookingSlotDetails
            grenId={grenId}
            slot={slot}
            presentation={presentation}
            onBook={onBook}
            onFjern={onFjern}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default memo(BookingSlotRow);
