import { useState, useEffect } from "react";
import PageSection from "@/components/sections/PageSection";
import { Stack, Inline } from "@/components/layout";
import { RowPanel, RowList } from "@/components/rows";
import SwitchRow from "@/components/rows/SwitchRow";
import { ServerFeil } from "@/components/errors";
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
import { Timer, Calendar, XCircle } from "lucide-react";
import type { MinBookingRespons } from "@/types";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";

function formatKort(t: string) {
  const [h, m] = t.slice(0, 5).split(":");
  return m === "00" ? h : `${h}:${m}`;
}

import { buildBookingKey } from "./bookingSort";

type Props = {
  visHistoriske: boolean;
  onToggleVisHistoriske: (value: boolean) => void;

  bookinger: MinBookingRespons[];
  isPending: boolean;

  onFjern: (slot: MinBookingRespons) => void;
  serverFeil: string | null;
};

export default function MineBookingerContent({
  visHistoriske,
  onToggleVisHistoriske,
  bookinger,
  isPending,
  onFjern,
  serverFeil,
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
          <ServerFeil feil={serverFeil} />
          <Accordion
            type="single"
            collapsible
            className={`space-y-1 mt-2 ${isPending ? "pointer-events-none opacity-60" : ""}`}
          >
            {synligeBookinger.map((b) => {
              const key = buildBookingKey(b);
              const tid = `${b.startTid.slice(0, 5)} – ${b.sluttTid.slice(0, 5)}`;
              const tidKort = `${formatKort(b.startTid)}–${formatKort(b.sluttTid)}`;
              const kanFjerne = harHandling(b.kapabiliteter, Kapabiliteter.booking.fjern);
              const harVaer =
                !!b.værSymbol || typeof b.temperatur === "number" || typeof b.vind === "number";

              const [startH, startM] = b.startTid.split(":").map(Number);
              const [sluttH, sluttM] = b.sluttTid.split(":").map(Number);
              const varighet = sluttH * 60 + sluttM - (startH * 60 + startM);

              return (
                <AccordionItem
                  key={key}
                  value={key}
                  className={`rounded-md border bg-background px-2 last:border-b shadow-sm ${b.erPassert ? "opacity-50" : ""}`}
                >
                  <AccordionTrigger className="hover:no-underline">
                    <Stack gap="xs" className="items-start">
                      <Inline gap="md">
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
                      </Inline>
                      <span className="text-xs text-muted-foreground">
                        {formatDatoKort(b.dato)}
                      </span>
                    </Stack>
                  </AccordionTrigger>

                  <AccordionContent>
                    <Stack gap="sm">
                      <AccordionDetailGrid>
                        <AccordionDetailRow icon={Calendar} label="Dato">
                          {formatDatoKort(b.dato)}
                        </AccordionDetailRow>

                        <AccordionDetailRow icon={Timer} label="Varighet">
                          {varighet} min
                        </AccordionDetailRow>

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

                      {kanFjerne && (
                        <AccordionActions>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onFjern(b);
                            }}
                            className="flex items-center gap-2 text-sm"
                          >
                            <XCircle className="size-4" />
                            Avbestill
                          </Button>
                        </AccordionActions>
                      )}
                    </Stack>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {harFlere && (
            <Inline justify="center" className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSynligAntall((prev) => prev + PAGE_SIZE)}
              >
                Vis flere ({bookinger.length - synligAntall} gjenstår)
              </Button>
            </Inline>
          )}
        </>
      )}
    </PageSection>
  );
}
