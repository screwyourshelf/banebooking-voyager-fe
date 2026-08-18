import { useMemo, useState } from "react";
import { isBefore, isSameDay, startOfDay } from "date-fns";
import { CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { BookingSlotRespons } from "@/types";
import { grupperSlots } from "@/utils/bookingUtils";
import { bookingSlotStyles } from "@/styles/recipes";
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
};

export function BookingSlotListAccordion({
  grenId,
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

  if (isLoading) {
    return (
      <div className="space-y-3" aria-label="Laster tider">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
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
    <div className={bookingSlotStyles.list}>
      {slotsÅVise.length === 0 ? (
        <BookingSlotEmptyState
          title="Dagens spilletider er over"
          description="Vis passerte tider eller velg neste dag."
        />
      ) : (
        <div className={bookingSlotStyles.slots} aria-label="Tilgjengelige tider">
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
        </div>
      )}

      {erIDag && antallPasserte > 0 ? (
        <div className="flex justify-center pt-1">
          <Button variant="outline" size="sm" onClick={() => setVisPasserte((current) => !current)}>
            {visPasserte ? "Skjul passerte" : `Vis passerte (${antallPasserte})`}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function BookingSlotEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div
      className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-12 text-center"
      role="status"
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-muted">
        <CalendarX className="size-5 text-muted-foreground" aria-hidden="true" />
      </span>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function getSlotGroups(slots: BookingSlotRespons[]) {
  const synligeSlots = grupperSlots(slots);
  const kommendeSlots = synligeSlots.filter((slot) => !slot.erPassert);
  const antallPasserte = synligeSlots.length - kommendeSlots.length;

  return { synligeSlots, kommendeSlots, antallPasserte };
}
