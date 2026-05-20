import { useState } from "react";
import { usePagination } from "@/hooks/usePagination";
import { useNavigate } from "react-router-dom";
import PageSection from "@/components/sections/PageSection";
import { Stack, Inline } from "@/components/layout";
import { RowPanel, RowList } from "@/components/rows";
import SwitchRow from "@/components/rows/SwitchRow";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AccordionActions } from "@/components/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDatoKort, dagerIgjenTekst } from "@/utils/datoUtils";
import { Ban, Trophy, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { SlettArrangementDialog } from "@/features/arrangement-admin/components";
import { ServerFeil } from "@/components/errors";

import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";
import type { ArrangementRespons, DagMedSlotsRespons } from "@/types";

type Props = {
  visHistoriske: boolean;
  onToggleVisHistoriske: (value: boolean) => void;

  arrangementer: ArrangementRespons[];
  onAvlys: (arr: ArrangementRespons) => Promise<unknown>;
  defaultArrangementId?: string;
  serverFeil?: string | null;
};

const TURNERING_STATUS_TEKST: Record<string, string> = {
  Oppsett: "Påmelding åpner snart",
  PaameldingAapen: "Påmelding åpen",
  Pagaar: "Turnering pågår",
  Avsluttet: "Avsluttet",
};

function datoTekst(arr: ArrangementRespons) {
  return arr.startDato === arr.sluttDato
    ? formatDatoKort(arr.startDato)
    : `${formatDatoKort(arr.startDato)} – ${formatDatoKort(arr.sluttDato)}`;
}

function formatDatoMedUkedagKort(dato: string): string {
  const [år, måned, dag] = dato.split("-").map(Number);
  const d = new Date(år, måned - 1, dag);
  const ukedag = d.toLocaleDateString("nb-NO", { weekday: "short" });
  const dagDel = d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
  // Capitalise first letter, strip trailing dot from weekday
  const ukedagKort = ukedag.replace(".", "");
  return `${ukedagKort.charAt(0).toUpperCase()}${ukedagKort.slice(1)} ${dagDel}`;
}

const INITIAL_DATOER = 3;
const DATOER_PER_KLIKK = 3;

function lagSummary(slotsPrDag: DagMedSlotsRespons[]) {
  const idag = new Date().toISOString().slice(0, 10);
  const kommende = slotsPrDag.filter((d) => d.dato >= idag);
  if (kommende.length === 0) return null;

  const alleBaner = kommende.flatMap((d) => d.slots.flatMap((s) => s.baneNavn));
  const unikeBaner = [...new Set(alleBaner)].sort();
  const baneTekst =
    unikeBaner.length <= 2
      ? unikeBaner.join(" og ")
      : `${unikeBaner.slice(0, -1).join(", ")} og ${unikeBaner[unikeBaner.length - 1]}`;

  const alleTider = kommende.flatMap((d) => d.slots);
  const minStart = alleTider.map((s) => s.startTid.slice(0, 5)).sort()[0];
  const maxSlutt = alleTider.map((s) => s.sluttTid.slice(0, 5)).sort().at(-1);
  const antallSlots = kommende.reduce((sum, d) => sum + d.slots.length, 0);

  return { tidsspenn: `${minStart}–${maxSlutt}`, baner: baneTekst, antall: antallSlots, antallDager: kommende.length };
}

function nesteKommendeDato(slotsPrDag: DagMedSlotsRespons[]): string | null {
  const idag = new Date().toISOString().slice(0, 10);
  return slotsPrDag.find((d) => d.dato >= idag)?.dato ?? null;
}

type ArrangementAccordionItemProps = {
  arr: ArrangementRespons;
  navigate: ReturnType<typeof useNavigate>;
  onAvlys: (arr: ArrangementRespons) => Promise<unknown>;
  kopierLenke?: never;
};

function ArrangementAccordionItem({ arr, navigate, onAvlys }: ArrangementAccordionItemProps) {
  const idag = new Date().toISOString().slice(0, 10);
  const kommende = (arr.slotsPrDag ?? []).filter((d) => d.dato >= idag);
  const beskrivelse = arr.beskrivelse?.trim() ?? "";

  const [visProgram, setVisProgram] = useState(false);
  const [synligeDatoerAntall, setSynligeDatoerAntall] = useState(INITIAL_DATOER);

  const summary = lagSummary(arr.slotsPrDag ?? []);
  const nesteDato = nesteKommendeDato(arr.slotsPrDag ?? []);

  const synligeDatoer = kommende.slice(0, synligeDatoerAntall);
  const harFlereDatoer = kommende.length > synligeDatoerAntall;

  const harHandlinger =
    harHandling(arr.kapabiliteter, Kapabiliteter.arrangement.seTurnering) ||
    harHandling(arr.kapabiliteter, Kapabiliteter.arrangement.administrerTurnering) ||
    (!arr.erPassert && harHandling(arr.kapabiliteter, Kapabiliteter.arrangement.avlys));

  const programKnappLabel = summary
    ? `Vis program (${summary.antall} booking${summary.antall !== 1 ? "er" : ""} / ${summary.antallDager} dag${summary.antallDager !== 1 ? "er" : ""})`
    : "Vis program";

  return (
    <AccordionItem
      value={arr.id}
      className={`rounded-md border bg-background px-2 last:border-b shadow-sm ${
        arr.erPassert ? "opacity-50" : ""
      }`}
    >
      <AccordionTrigger className="hover:no-underline">
        <Stack gap="xs" className="items-start">
          <Inline gap="md">
            <span className="font-medium">{arr.tittel}</span>
            {arr.erPassert ? (
              <Badge variant="outline" className="text-xs">
                Gjennomført
              </Badge>
            ) : nesteDato ? (
              <Badge variant="secondary" className="text-xs">
                {dagerIgjenTekst(nesteDato)}
              </Badge>
            ) : null}
          </Inline>
          <span className="text-xs text-muted-foreground">{datoTekst(arr)}</span>

          {arr.turneringStatus !== null && (
            <span className="text-xs text-muted-foreground">
              <Trophy className="inline h-3 w-3 mr-1 opacity-70" />
              {TURNERING_STATUS_TEKST[arr.turneringStatus] ?? arr.turneringStatus}
            </span>
          )}
        </Stack>
      </AccordionTrigger>

      <AccordionContent>
        <Stack gap="sm" className="pb-1">
          {/* Beskrivelse — alltid synlig */}
          {beskrivelse && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{beskrivelse}</p>
          )}

          {/* Program-toggle */}
          {summary ? (
            <div>
              <button
                type="button"
                onClick={() => setVisProgram((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-md px-2.5 py-1 transition-colors hover:bg-accent"
              >
                {visProgram ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                {visProgram ? "Skjul program" : programKnappLabel}
              </button>

              {visProgram && (
                <div className="mt-3 space-y-3">
                  {synligeDatoer.map(({ dato, slots }) => (
                    <div key={dato}>
                      <p className="text-xs font-semibold mb-1">{formatDatoMedUkedagKort(dato)}</p>
                      <div className="space-y-0.5 pl-3 border-l-2 border-muted">
                        {slots.map((s) => {
                          const sorterteBaner = [...s.baneNavn].sort();
                          const baneTekst =
                            sorterteBaner.length <= 2
                              ? sorterteBaner.join(" og ")
                              : `${sorterteBaner.slice(0, -1).join(", ")} og ${sorterteBaner[sorterteBaner.length - 1]}`;
                          return (
                            <p
                              key={s.startTid}
                              className="text-sm text-muted-foreground"
                            >
                              {s.startTid.slice(0, 5)}–{s.sluttTid.slice(0, 5)} · {baneTekst}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {harFlereDatoer && (
                    <button
                      type="button"
                      onClick={() => setSynligeDatoerAntall((n) => n + DATOER_PER_KLIKK)}
                      className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                    >
                      Vis flere datoer
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : !arr.erPassert ? (
            <p className="text-sm text-muted-foreground/60 italic">Ingen kommende bookinger.</p>
          ) : null}

          {/* 4. Handlingsknapper — alltid nederst */}
          {harHandlinger && (
            <AccordionActions className="flex-wrap gap-2">
              {harHandling(arr.kapabiliteter, Kapabiliteter.arrangement.administrerTurnering) ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`../turnering/${arr.turneringId}`)}
                  className="flex items-center gap-2 text-sm"
                >
                  <Settings className="h-4 w-4" />
                  Administrer turnering
                </Button>
              ) : harHandling(arr.kapabiliteter, Kapabiliteter.arrangement.seTurnering) ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`../turnering/${arr.turneringId}`)}
                  className="flex items-center gap-2 text-sm"
                >
                  <Trophy className="h-4 w-4" />
                  Se turnering
                </Button>
              ) : null}
              {!arr.erPassert &&
                harHandling(arr.kapabiliteter, Kapabiliteter.arrangement.avlys) && (
                  <SlettArrangementDialog
                    tittel={arr.tittel}
                    harTurnering={arr.turneringId !== null}
                    onSlett={() => onAvlys(arr).then(() => {})}
                    trigger={
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-2 text-sm"
                      >
                        <Ban className="size-4" />
                        Avlys
                      </Button>
                    }
                  />
                )}
            </AccordionActions>
          )}
        </Stack>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function ArrangementerContent({
  visHistoriske,
  onToggleVisHistoriske,
  arrangementer,
  onAvlys,
  defaultArrangementId,
  serverFeil,
}: Props) {
  const navigate = useNavigate();

  const [åpentId, setÅpentId] = useState<string | undefined>(defaultArrangementId);

  const {
    synlige: synligeArrangementer,
    harFlere,
    gjenstaar,
    visFlere,
  } = usePagination(arrangementer, 10, visHistoriske);

  const tomTekst = visHistoriske
    ? "Ingen arrangementer registrert."
    : "Ingen kommende arrangementer.";

  return (
    <PageSection
      title="Arrangementer"
      description="Oversikt over kommende arrangementer i klubben."
    >
      <RowPanel>
        <RowList>
          <SwitchRow
            title="Vis også tidligere arrangementer"
            checked={visHistoriske}
            onCheckedChange={onToggleVisHistoriske}
            density="compact"
          />
        </RowList>
      </RowPanel>

      {arrangementer.length === 0 ? (
        <p className="text-sm text-muted-foreground italic mt-4">{tomTekst}</p>
      ) : (
        <>
          <ServerFeil feil={serverFeil ?? null} />
          <Accordion
            type="single"
            collapsible
            className="space-y-1 mt-2"
            value={åpentId}
            onValueChange={setÅpentId}
          >
            {synligeArrangementer.map((arr) => (
              <ArrangementAccordionItem
                key={arr.id}
                arr={arr}
                navigate={navigate}
                onAvlys={onAvlys}
              />
            ))}
          </Accordion>

          {harFlere && (
            <Inline justify="center" className="mt-4">
              <Button variant="outline" size="sm" onClick={visFlere}>
                Vis flere ({gjenstaar} gjenstår)
              </Button>
            </Inline>
          )}
        </>
      )}
    </PageSection>
  );
}
