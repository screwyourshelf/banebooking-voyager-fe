import DatoVelger from "@/components/DatoVelger";
import { BookingSlotListAccordion } from "@/features/booking/components";
import { TabsLazyMount } from "@/components/navigation";

import type { KalenderSlotRespons, BaneRespons } from "@/types";
import type { User } from "@supabase/supabase-js";

type Props = {
  baner: BaneRespons[];
  valgtBaneId: string;
  onBaneChange: (baneId: string) => void;

  valgtDato: Date | null;
  onDatoChange: (dato: Date | null) => void;

  slots: KalenderSlotRespons[];
  isLoading: boolean;

  currentUser: User | null;

  onBook: (slot: KalenderSlotRespons) => void;
  onCancel: (slot: KalenderSlotRespons) => void;
  onDelete: (slot: KalenderSlotRespons) => void;
  onMeldPaa: (slot: KalenderSlotRespons) => void;
  onMeldAv: (slot: KalenderSlotRespons) => void;
};

export default function BookingContent({
  baner,
  valgtBaneId,
  onBaneChange,
  valgtDato,
  onDatoChange,
  slots,
  isLoading,
  currentUser,
  onBook,
  onCancel,
  onDelete,
  onMeldPaa,
  onMeldAv,
}: Props) {
  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <DatoVelger
          value={valgtDato}
          onChange={(date) => onDatoChange(date ?? null)}
          visNavigering={true}
        />
      </div>

      <TabsLazyMount
        items={baner.map((bane) => ({
          value: bane.id,
          label: bane.navn,
          content: (
            <BookingSlotListAccordion
              slots={slots}
              currentUser={currentUser ? { epost: currentUser.email ?? "" } : null}
              onBook={onBook}
              onCancel={onCancel}
              onDelete={onDelete}
              onMeldPaa={onMeldPaa}
              onMeldAv={onMeldAv}
              isLoading={isLoading}
            />
          ),
        }))}
        value={valgtBaneId}
        onValueChange={onBaneChange}
      />
    </>
  );
}
