import { HelpCircle } from "lucide-react";

import DatoVelger from "@/components/DatoVelger";
import { BookingSlotListAccordion, ReglementDialog } from "@/features/booking/components";
import { TabsLazyMount } from "@/components/navigation";
import { Button } from "@/components/ui/button";

import type { BookingSlotRespons, BaneRespons } from "@/types";
import type { User } from "@supabase/supabase-js";

type Props = {
  baner: BaneRespons[];
  valgtBaneId: string;
  onBaneChange: (baneId: string) => void;

  valgtDato: Date | null;
  onDatoChange: (dato: Date | null) => void;

  slots: BookingSlotRespons[];
  isLoading: boolean;

  currentUser: User | null;

  onBook: (slot: BookingSlotRespons) => void;
  onCancel: (slot: BookingSlotRespons) => void;
  onDelete: (slot: BookingSlotRespons) => void;
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
}: Props) {
  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <ReglementDialog>
          <Button variant="ghost" size="icon" className="rounded-full" title="Vis banereglement">
            <HelpCircle className="w-5 h-5" />
          </Button>
        </ReglementDialog>

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
            // ACCORDION-VERSJON (ny)
            <BookingSlotListAccordion
              slots={slots}
              currentUser={currentUser ? { epost: currentUser.email ?? "" } : null}
              onBook={onBook}
              onCancel={onCancel}
              onDelete={onDelete}
              isLoading={isLoading}
            />
            // ORIGINAL VERSJON (kommenter inn denne og kommenter ut Accordion for å bytte tilbake):
            // <BookingSlotList
            //   slots={slots}
            //   currentUser={currentUser ? { epost: currentUser.email ?? "" } : null}
            //   apenSlotTid={apenSlotTid}
            //   setApenSlotTid={setApenSlotTid}
            //   onBook={onBook}
            //   onCancel={onCancel}
            //   onDelete={onDelete}
            //   isLoading={isLoading}
            // />
          ),
        }))}
        value={valgtBaneId}
        onValueChange={onBaneChange}
      />
    </>
  );
}
