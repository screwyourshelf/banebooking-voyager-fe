import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList } from "@/components/rows";
import SwitchRow from "@/components/rows/SwitchRow";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AccordionDetailGrid, AccordionDetailRow, AccordionActions } from "@/components/accordion";
import WeatherInfo from "@/components/WeatherInfo";
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
                      <WeatherInfo
                        værSymbol={b.værSymbol}
                        temperatur={b.temperatur}
                        vind={b.vind}
                      />
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent>
                  <div className="space-y-4">
                    <AccordionDetailGrid>
                      <AccordionDetailRow icon={MapPin} label="Bane">
                        {b.baneNavn}
                      </AccordionDetailRow>

                      <AccordionDetailRow icon={Calendar} label="Dato">
                        {formatDatoKort(b.dato)}
                      </AccordionDetailRow>

                      <AccordionDetailRow icon={Clock} label="Tidspunkt" colSpan={2}>
                        {tid}
                      </AccordionDetailRow>
                    </AccordionDetailGrid>

                    {kanAvbestille && (
                      <AccordionActions>
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
                      </AccordionActions>
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
