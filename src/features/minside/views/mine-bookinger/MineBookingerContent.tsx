import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList } from "@/components/rows";
import SwitchRow from "@/components/rows/SwitchRow";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDatoKort } from "@/utils/datoUtils";
import { Calendar, Clock, MapPin } from "lucide-react";
import { FaTimesCircle } from "react-icons/fa";
import type { BookingSlotRespons } from "@/types";

import { buildBookingKey } from "./bookingSort";

type Props = {
  visHistoriske: boolean;
  onToggleVisHistoriske: (value: boolean) => void;

  bookinger: BookingSlotRespons[];
  isPending: boolean;

  onAvbestill: (slot: BookingSlotRespons) => void;
};

export default function MineBookingerContent({
  visHistoriske,
  onToggleVisHistoriske,
  bookinger,
  isPending,
  onAvbestill,
}: Props) {
  const hasBookinger = bookinger.length > 0;

  const tomTekst = visHistoriske
    ? "Du har ingen registrerte bookinger."
    : "Du har ingen kommende bookinger.";

  return (
    <PageSection
      title="Bookinger"
      description="Se kommende bookinger og velg om du vil inkludere tidligere."
    >
      <RowPanel>
        <RowList>
          <SwitchRow
            title="Vis også tidligere bookinger"
            description="Inkluder bookinger som allerede er gjennomført."
            checked={visHistoriske}
            onCheckedChange={onToggleVisHistoriske}
          />
        </RowList>
      </RowPanel>

      {!hasBookinger ? (
        <p className="text-sm text-muted-foreground italic mt-4">{tomTekst}</p>
      ) : (
        <Accordion
          type="single"
          collapsible
          className={`rounded-md border bg-background mt-4 ${isPending ? "pointer-events-none opacity-60" : ""}`}
        >
          {bookinger.map((b) => {
            const key = buildBookingKey(b);
            const tid = `${b.startTid.slice(0, 5)} – ${b.sluttTid.slice(0, 5)}`;
            const kanAvbestille = b.kanAvbestille && !b.erPassert;

            const harVaer =
              !!b.værSymbol || typeof b.temperatur === "number" || typeof b.vind === "number";

            return (
              <AccordionItem
                key={key}
                value={key}
                className={`px-4 ${b.erPassert ? "opacity-50" : ""}`}
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-col items-start gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{b.baneNavn}</span>
                      {b.erPassert && (
                        <Badge variant="outline" className="text-xs">
                          Gjennomført
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDatoKort(b.dato)}</span>
                      {harVaer && (
                        <span className="flex items-center gap-1">
                          {b.værSymbol && (
                            <img
                              src={`${import.meta.env.BASE_URL}weather-symbols/svg/${b.værSymbol}.svg`}
                              alt={b.værSymbol}
                              width={16}
                              height={16}
                              className="select-none"
                              draggable={false}
                            />
                          )}
                          {typeof b.temperatur === "number" && <span>{b.temperatur}°</span>}
                          {typeof b.vind === "number" && <span>{b.vind} m/s</span>}
                        </span>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent>
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">Bane</div>
                          <div className="text-sm">{b.baneNavn}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">Dato</div>
                          <div className="text-sm">{formatDatoKort(b.dato)}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 sm:col-span-2">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">Tidspunkt</div>
                          <div className="text-sm">{tid}</div>
                        </div>
                      </div>
                    </div>

                    {kanAvbestille && (
                      <div className="flex justify-end pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAvbestill(b);
                          }}
                          className="flex items-center gap-2 text-sm"
                        >
                          <FaTimesCircle />
                          Avbestill
                        </Button>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </PageSection>
  );
}
