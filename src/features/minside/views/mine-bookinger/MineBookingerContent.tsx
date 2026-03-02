import { useState, useEffect } from "react";
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
import { Timer, User, XCircle } from "lucide-react";
import type { BookingSlotRespons } from "@/types";
import { harHandling } from "@/utils/handlingUtils";

import { buildBookingKey } from "./bookingSort";

function dagerIgjenFra(datoIso: string) {
  const start = new Date(datoIso);
  const iDag = new Date();

  const startMidnatt = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const iDagMidnatt = new Date(iDag.getFullYear(), iDag.getMonth(), iDag.getDate());

  const diffMs = startMidnatt.getTime() - iDagMidnatt.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

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
  const PAGE_SIZE = 10;
  const [synligAntall, setSynligAntall] = useState(PAGE_SIZE);

  useEffect(() => {
    setSynligAntall(PAGE_SIZE);
  }, [visHistoriske]);

  const hasBookinger = bookinger.length > 0;
  const synligeBookinger = bookinger.slice(0, synligAntall);
  const harFlere = synligAntall < bookinger.length;

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
            checked={visHistoriske}
            onCheckedChange={onToggleVisHistoriske}
            density="compact"
          />
        </RowList>
      </RowPanel>

      {!hasBookinger ? (
        <p className="text-sm text-muted-foreground italic mt-4">{tomTekst}</p>
      ) : (
        <>
          <Accordion
            type="single"
            collapsible
            className={`space-y-2 mt-4 ${isPending ? "pointer-events-none opacity-60" : ""}`}
          >
            {synligeBookinger.map((b) => {
              const key = buildBookingKey(b);
              const tid = `${b.startTid.slice(0, 5)} – ${b.sluttTid.slice(0, 5)}`;
              const kanAvbestille = harHandling(b.tillattHandlinger, "booking:avbestill");
              const dagerIgjen = b.erPassert ? null : dagerIgjenFra(b.dato);

              const [startH, startM] = b.startTid.split(":").map(Number);
              const [sluttH, sluttM] = b.sluttTid.split(":").map(Number);
              const varighet = sluttH * 60 + sluttM - (startH * 60 + startM);

              return (
                <AccordionItem
                  key={key}
                  value={key}
                  className={`rounded-md border bg-background px-4 last:border-b shadow-sm ${b.erPassert ? "opacity-50" : ""}`}
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-col items-start gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{b.baneNavn}</span>
                        {b.erPassert ? (
                          <Badge variant="outline" className="text-xs">
                            Gjennomført
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            {dagerIgjen} {dagerIgjen === 1 ? "dag" : "dager"}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDatoKort(b.dato)}</span>
                        <span>·</span>
                        <span>{tid}</span>
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
                        <AccordionDetailRow icon={Timer} label="Varighet">
                          {varighet} min
                        </AccordionDetailRow>

                        {b.booketAv && (
                          <AccordionDetailRow icon={User} label="Booket av">
                            {b.booketAv}
                          </AccordionDetailRow>
                        )}
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
                            <XCircle className="size-4" />
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

          {harFlere && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSynligAntall((prev) => prev + PAGE_SIZE)}
              >
                Vis flere ({bookinger.length - synligAntall} gjenstår)
              </Button>
            </div>
          )}
        </>
      )}
    </PageSection>
  );
}
