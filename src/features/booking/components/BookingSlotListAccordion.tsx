import { useMemo, useState } from "react";
import { isBefore, isSameDay, startOfDay } from "date-fns";
import { Inline } from "@/components/layout";
import { RecordAccordionList, RecordCollectionSkeleton } from "@/components/records";
import { Button } from "@/components/ui/button";
import type { BookingSlotRespons } from "@/types";
import { grupperSlots } from "@/utils/bookingUtils";
import BookingSlotRow from "./BookingSlotRow";
import { getBookingSlotKey } from "./bookingSlotPresentation";

type Props = {
  slots: BookingSlotRespons[];
  valgtDato: Date | null;
  isAuthenticated: boolean;
  onBook?: (slot: BookingSlotRespons, arrangementId?: string) => void;
  onFjern?: (slot: BookingSlotRespons) => void;
  isLoading?: boolean;
};

export function BookingSlotListAccordion({
  slots,
  valgtDato,
  isAuthenticated,
  onBook,
  onFjern,
  isLoading = false,
}: Props) {
  const iDag = startOfDay(new Date());
  const erHistorisk = valgtDato ? isBefore(valgtDato, iDag) : false;
  const erIDag = valgtDato ? isSameDay(valgtDato, iDag) : false;
  const [visPasserte, setVisPasserte] = useState(erHistorisk);

  const { synligeSlots, kommendeSlots, antallPasserte } = useMemo(
    () => getSlotGroups(slots),
    [slots]
  );

  if (isLoading) return <RecordCollectionSkeleton ariaLabel="Laster tider" rows={5} />;

  if (slots.length === 0) {
    return (
      <BookingSlotEmptyState
        title="Ingen tider denne dagen"
        description="Prøv en annen dato eller bane."
      />
    );
  }

  const slotsÅVise = erIDag && !visPasserte ? kommendeSlots : synligeSlots;

  function handleTogglePasserte() {
    setVisPasserte((current) => !current);
  }

  return (
    <>
      {slotsÅVise.length === 0 ? (
        <BookingSlotEmptyState
          title="Dagens spilletider er over"
          description="Vis passerte tider eller velg neste dag."
        />
      ) : (
        <RecordAccordionList ariaLabel="Tilgjengelige tider">
          {slotsÅVise.map((slot) => (
            <BookingSlotRow
              key={getBookingSlotKey(slot)}
              slot={slot}
              isAuthenticated={isAuthenticated}
              onBook={onBook}
              onFjern={onFjern}
            />
          ))}
        </RecordAccordionList>
      )}

      {erIDag && antallPasserte > 0 ? (
        <Inline justify="center" className="booking-slot-list__past-toggle">
          <Button variant="outline" size="sm" onClick={handleTogglePasserte}>
            {visPasserte ? "Skjul passerte" : `Vis passerte (${antallPasserte})`}
          </Button>
        </Inline>
      ) : null}
    </>
  );
}

function BookingSlotEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="booking-slot__empty" role="status">
      <div className="booking-slot__empty-title">{title}</div>
      <p className="booking-slot__empty-copy">{description}</p>
    </div>
  );
}

function getSlotGroups(slots: BookingSlotRespons[]) {
  const synligeSlots = grupperSlots(slots);
  const kommendeSlots = synligeSlots.filter((slot) => !slot.erPassert);
  const antallPasserte = synligeSlots.length - kommendeSlots.length;

  return { synligeSlots, kommendeSlots, antallPasserte };
}
