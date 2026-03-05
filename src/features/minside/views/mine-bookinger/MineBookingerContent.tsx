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
import { formatDatoKort, dagerIgjenTekst } from "@/utils/datoUtils";
import { Timer, User, Calendar, XCircle } from "lucide-react";
import type { BookingSlotRespons } from "@/types";
import { harHandling } from "@/utils/handlingUtils";
import { grupperSlots } from "@/utils/bookingUtils";

function formatKort(t: string) {
  const [h, m] = t.slice(0, 5).split(":");
  return m === "00" ? h : `${h}:${m}`;
}

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
  const PAGE_SIZE = 10;
  const [synligAntall, setSynligAntall] = useState(PAGE_SIZE);

  useEffect(() => {
    setSynligAntall(PAGE_SIZE);
  }, [visHistoriske]);

  const hasBookinger = bookinger.length > 0;
  const grupperteBookinger = grupperSlots(bookinger);
  const synligeBookinger = grupperteBookinger.slice(0, synligAntall);
  const harFlere = synligAntall < grupperteBookinger.length;

  const tomTekst = visHistoriske
    ? "Du har ingen registrerte bookinger."
    : "Du har ingen kommende bookinger.";

  return (
    <PageSection
      title="Bookinger"
      description="Oversikt over dine kommende og tidligere bookinger."
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
            className={`space-y-1 mt-2 ${isPending ? "pointer-events-none opacity-60" : ""}`}
          >
            {synligeBookinger.map((b) => {
              const key = buildBookingKey(b);
              const effStartTid = b.bookingStartTid ?? b.startTid;
              const effSluttTid = b.bookingSluttTid ?? b.sluttTid;
              const tid = `${effStartTid.slice(0, 5)} – ${effSluttTid.slice(0, 5)}`;
              const tidKort = `${formatKort(effStartTid)}–${formatKort(effSluttTid)}`;
              const kanAvbestille = harHandling(b.tillattHandlinger, "booking:avbestill");
              const harVaer =
                !!b.værSymbol || typeof b.temperatur === "number" || typeof b.vind === "number";

              const [startH, startM] = effStartTid.split(":").map(Number);
              const [sluttH, sluttM] = effSluttTid.split(":").map(Number);
              const varighet = sluttH * 60 + sluttM - (startH * 60 + startM);

              return (
                <AccordionItem
                  key={key}
                  value={key}
                  className={`rounded-md border bg-background px-2 last:border-b shadow-sm ${b.erPassert ? "opacity-50" : ""}`}
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-col items-start gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{b.baneNavn}</span>
                        <span className="font-medium sm:hidden">{tidKort}</span>
                        <span className="font-medium hidden sm:inline">{tid}</span>
                        <WeatherInfo værSymbol={b.værSymbol} iconOnly />
                        {b.erPassert ? (
                          <Badge variant="outline" className="text-xs">
                            Gjennomført
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            {dagerIgjenTekst(b.dato)}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDatoKort(b.dato)}
                      </span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent>
                    <div className="space-y-3">
                      <AccordionDetailGrid>
                        <AccordionDetailRow icon={Calendar} label="Dato">
                          {formatDatoKort(b.dato)}
                        </AccordionDetailRow>

                        <AccordionDetailRow icon={Timer} label="Varighet">
                          {varighet} min
                        </AccordionDetailRow>

                        {b.booketAv && (
                          <AccordionDetailRow icon={User} label="Booket av">
                            {b.booketAv}
                          </AccordionDetailRow>
                        )}

                        {harVaer && (
                          <div className="flex items-start gap-2 sm:col-span-2">
                            {b.værSymbol && (
                              <img
                                src={`${import.meta.env.BASE_URL}weather-symbols/svg/${b.værSymbol}.svg`}
                                alt={b.værSymbol}
                                width={16}
                                height={16}
                                className="select-none mt-0.5 shrink-0"
                                draggable={false}
                              />
                            )}
                            <div>
                              <div className="text-xs font-medium text-muted-foreground">Vær</div>
                              <div className="text-sm">
                                {typeof b.temperatur === "number" && <span>{b.temperatur}°c</span>}
                                {typeof b.temperatur === "number" &&
                                  typeof b.vind === "number" &&
                                  " · "}
                                {typeof b.vind === "number" && <span>{b.vind} m/s</span>}
                              </div>
                            </div>
                          </div>
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
                Vis flere ({grupperteBookinger.length - synligAntall} gjenstår)
              </Button>
            </div>
          )}
        </>
      )}
    </PageSection>
  );
}
