import { useMemo, useState } from "react";
import { isBefore, isSameDay, startOfDay } from "date-fns";
import { CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  RecordAccordionList,
  RecordCollectionPagination,
  RecordCollectionSkeleton,
  RecordListState,
} from "@/components/records";
import type { BookingSlotRespons } from "@/types";
import { grupperSlots } from "@/utils/bookingUtils";
import BookingSlotRow from "./BookingSlotRow";
import { getBookingSlotKey } from "./bookingSlotPresentation";

type Props = {
  grenId: string;
  slots: BookingSlotRespons[];
  valgtDato: Date | null;
  isAuthenticated: boolean;
  onBook?: (slot: BookingSlotRespons, arrangementId?: string) => void;
  onFjern?: (slot: BookingSlotRespons) => void;
  isLoading?: boolean;
  isFetching?: boolean;
};

export function BookingSlotListAccordion({
  grenId,
  slots,
  valgtDato,
  isAuthenticated,
  onBook,
  onFjern,
  isLoading = false,
  isFetching = false,
}: Props) {
  const iDag = startOfDay(new Date());
  const erHistorisk = valgtDato ? isBefore(valgtDato, iDag) : false;
  const erIDag = valgtDato ? isSameDay(valgtDato, iDag) : false;
  const [visPasserte, setVisPasserte] = useState(erHistorisk);

  const { synligeSlots, kommendeSlots, antallPasserte } = useMemo(
    () => getSlotGroups(slots),
    [slots]
  );

  if (isLoading) {
    return <RecordCollectionSkeleton ariaLabel="Laster tider" rows={5} layout="time" />;
  }

  if (slots.length === 0) {
    return (
      <BookingSlotEmptyState
        title="Ingen tider denne dagen"
        description="Prøv en annen dato eller bane."
      />
    );
  }

  const slotsÅVise = erIDag && !visPasserte ? kommendeSlots : synligeSlots;

  return (
    <>
      {slotsÅVise.length === 0 ? (
        <BookingSlotEmptyState
          title="Dagens spilletider er over"
          description="Vis passerte tider eller velg neste dag."
        />
      ) : (
        <RecordAccordionList loading={isFetching} ariaLabel="Tilgjengelige tider">
          {slotsÅVise.map((slot) => (
            <BookingSlotRow
              key={getBookingSlotKey(slot)}
              grenId={grenId}
              slot={slot}
              isAuthenticated={isAuthenticated}
              onBook={onBook}
              onFjern={onFjern}
            />
          ))}
        </RecordAccordionList>
      )}

      {erIDag && antallPasserte > 0 ? (
        <RecordCollectionPagination>
          <Button variant="outline" size="sm" onClick={() => setVisPasserte((current) => !current)}>
            {visPasserte ? "Skjul passerte" : `Vis passerte (${antallPasserte})`}
          </Button>
        </RecordCollectionPagination>
      ) : null}
    </>
  );
}

function BookingSlotEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <RecordListState
      icon={<CalendarX aria-hidden="true" />}
      title={title}
      description={description}
    />
  );
}

function getSlotGroups(slots: BookingSlotRespons[]) {
  const synligeSlots = grupperSlots(slots);
  const kommendeSlots = synligeSlots.filter((slot) => !slot.erPassert);
  const antallPasserte = synligeSlots.length - kommendeSlots.length;

  return { synligeSlots, kommendeSlots, antallPasserte };
}
