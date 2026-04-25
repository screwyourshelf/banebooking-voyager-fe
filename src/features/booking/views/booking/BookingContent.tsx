import DatoVelger from "@/components/DatoVelger";
import { BookingSlotListAccordion } from "@/features/booking/components";
import { TabsLazyMount } from "@/components/navigation";
import { ServerFeil } from "@/components/errors";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter } from "lucide-react";

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
  isFetching: boolean;

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
  isFetching,
  currentUser,
  onBook,
  onFjern,
  onMeldPaa,
  onMeldAv,
  serverFeil,
}: Props) {
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <DatoVelger
          value={valgtDato}
          onChange={(date) => onDatoChange(date ?? null)}
          visNavigering={true}
        />
        {grener.length > 1 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                aria-label="Velg gren"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-1">
              <div className="flex flex-col gap-0.5">
                {grener.map((g) => (
                  <Button
                    key={g.id}
                    variant={g.id === valgtGrenId ? "default" : "ghost"}
                    size="sm"
                    className="justify-start text-sm"
                    onClick={() => onGrenChange(g.id)}
                  >
                    {g.navn}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <ServerFeil feil={serverFeil} />

      <TabsLazyMount
        items={baner.map((bane) => ({
          value: bane.id,
          label: bane.navn,
          content: (
            <div className={`transition-opacity duration-200 ${isFetching && !isLoading ? "opacity-50" : "opacity-100"}`}>
              <BookingSlotListAccordion
                slots={slots}
                currentUser={currentUser ? { epost: currentUser.email ?? "" } : null}
                onBook={onBook}
                onFjern={onFjern}
                onMeldPaa={onMeldPaa}
                onMeldAv={onMeldAv}
                isLoading={isLoading}
              />
            </div>
          ),
        }))}
        value={valgtBaneId}
        onValueChange={onBaneChange}
      />
    </>
  );
}
