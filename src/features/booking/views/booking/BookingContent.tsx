import DatoVelger from "@/components/DatoVelger";
import { BookingSlotListAccordion } from "@/features/booking/components";
import { TabsLazyMount } from "@/components/navigation";
import { Inline } from "@/components/layout";
import { ServerFeil } from "@/components/errors";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { KalenderSlotRespons, BaneRespons, GrenRespons } from "@/types";
import type { User } from "@supabase/supabase-js";

type Props = {
  grener: GrenRespons[];
  valgtGrenId: string;
  onGrenChange: (grenId: string) => void;

  baner: BaneRespons[];
  valgtBaneId: string;
  onBaneChange: (baneId: string) => void;

  valgtDato: Date | null;
  onDatoChange: (dato: Date | null) => void;

  slots: KalenderSlotRespons[];
  isLoading: boolean;

  currentUser: User | null;

  onBook: (slot: KalenderSlotRespons) => void;
  onFjern: (slot: KalenderSlotRespons) => void;
  onMeldPaa: (slot: KalenderSlotRespons) => void;
  onMeldAv: (slot: KalenderSlotRespons) => void;
  serverFeil: string | null;
};

export default function BookingContent({
  grener,
  valgtGrenId,
  onGrenChange,
  baner,
  valgtBaneId,
  onBaneChange,
  valgtDato,
  onDatoChange,
  slots,
  isLoading,
  currentUser,
  onBook,
  onFjern,
  onMeldPaa,
  onMeldAv,
  serverFeil,
}: Props) {
  return (
    <>
      <Inline justify="between" className="mb-2">
        <DatoVelger
          value={valgtDato}
          onChange={(date) => onDatoChange(date ?? null)}
          visNavigering={true}
        />
        {grener.length > 1 && (
          <Select value={valgtGrenId} onValueChange={onGrenChange}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Velg gren..." />
            </SelectTrigger>
            <SelectContent>
              {grener.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.navn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </Inline>

      <ServerFeil feil={serverFeil} />

      <TabsLazyMount
        items={baner.map((bane) => ({
          value: bane.id,
          label: bane.navn,
          content: (
            <BookingSlotListAccordion
              slots={slots}
              currentUser={currentUser ? { epost: currentUser.email ?? "" } : null}
              onBook={onBook}
              onFjern={onFjern}
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
