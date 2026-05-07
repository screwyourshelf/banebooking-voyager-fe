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
import {
  Ban,
  Trophy,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { SlettArrangementDialog } from "@/features/arrangement-admin/components";
import { ServerFeil } from "@/components/errors";
import { useSlug } from "@/hooks/useSlug";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";
import type { ArrangementRespons, ArrangementBookingRespons } from "@/types";
import { useArrangementKommendeBookinger } from "./useArrangementKommendeBookinger";

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

/** Grupperer bookinger per dato, og innenfor samme dato per tidsintervall.
 *  Baner for samme startTid+sluttTid slås sammen på én linje. */
function grupperPerDato(
  bookinger: ArrangementBookingRespons[]
): { dato: string; slots: { startTid: string; sluttTid: string; baner: string }[] }[] {
  const datoMap: Record<string, Record<string, string[]>> = {};
  for (const b of bookinger) {
    const tidNøkkel = `${b.startTid}|${b.sluttTid}`;
    if (!datoMap[b.dato]) datoMap[b.dato] = {};
    if (!datoMap[b.dato][tidNøkkel]) datoMap[b.dato][tidNøkkel] = [];
    datoMap[b.dato][tidNøkkel].push(b.baneNavn);
  }
  return Object.entries(datoMap).map(([dato, tider]) => ({
    dato,
    slots: Object.entries(tider).map(([tidNøkkel, baner]) => {
      const [startTid, sluttTid] = tidNøkkel.split("|");
      const sorterteBaner = [...baner].sort();
      const baneTekst =
        sorterteBaner.length <= 2
          ? sorterteBaner.join(" og ")
          : `${sorterteBaner.slice(0, -1).join(", ")} og ${sorterteBaner[sorterteBaner.length - 1]}`;
      return { startTid, sluttTid, baner: baneTekst };
    }),
  }));
}

function lagBookingSummary(bookinger: ArrangementBookingRespons[]) {
  if (bookinger.length === 0) return null;
  const sorterteStart = [...bookinger.map((b) => b.startTid.slice(0, 5))].sort();
  const sorterteSlutt = [...bookinger.map((b) => b.sluttTid.slice(0, 5))].sort();
  const minStart = sorterteStart[0];
  const maxSlutt = sorterteSlutt[sorterteSlutt.length - 1];
  const unikeBaner = [...new Set(bookinger.map((b) => b.baneNavn))].sort();
  const baneTekst =
    unikeBaner.length <= 2
      ? unikeBaner.join(" og ")
      : `${unikeBaner.slice(0, -1).join(", ")} og ${unikeBaner[unikeBaner.length - 1]}`;
  const antallDager = new Set(bookinger.map((b) => b.dato)).size;
  return {
    tidsspenn: `${minStart}–${maxSlutt}`,
    baner: baneTekst,
    antall: bookinger.length,
    antallDager,
  };
}

type ArrangementAccordionItemProps = {
  arr: ArrangementRespons;
  slug: string;
  navigate: ReturnType<typeof useNavigate>;
  onAvlys: (arr: ArrangementRespons) => Promise<unknown>;
  kopierLenke?: never;
};

function ArrangementAccordionItem({
  arr,
  slug,
  navigate,
  onAvlys,
}: ArrangementAccordionItemProps) {
  const { kommendeBookinger, isLoading } = useArrangementKommendeBookinger(arr.id);
  const beskrivelse = arr.beskrivelse?.trim() ?? "";

  const [visProgram, setVisProgram] = useState(false);
  const [synligeDatoerAntall, setSynligeDatoerAntall] = useState(INITIAL_DATOER);

  const gruppert = grupperPerDato(kommendeBookinger);
  const summary = lagBookingSummary(kommendeBookinger);

  const synligeDatoer = gruppert.slice(0, synligeDatoerAntall);
  const harFlereDatoer = gruppert.length > synligeDatoerAntall;

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
            ) : !isLoading && kommendeBookinger.length > 0 ? (
              <Badge variant="secondary" className="text-xs">
                {dagerIgjenTekst(kommendeBookinger[0].dato)}
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
          {isLoading ? (
            <p className="text-sm text-muted-foreground/60 italic">Laster program…</p>
          ) : summary ? (
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
                      <p className="text-xs font-semibold mb-1">
                        {formatDatoMedUkedagKort(dato)}
                      </p>
                      <div className="space-y-0.5 pl-3 border-l-2 border-muted">
                        {slots.map((s) => (
                          <p
                            key={`${s.startTid}-${s.sluttTid}`}
                            className="text-sm text-muted-foreground"
                          >
                            {s.startTid}–{s.sluttTid} · {s.baner}
                          </p>
                        ))}
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
                  onClick={() => navigate(`/${slug}/turnering/${arr.turneringId}`)}
                  className="flex items-center gap-2 text-sm"
                >
                  <Settings className="h-4 w-4" />
                  Administrer turnering
                </Button>
              ) : harHandling(arr.kapabiliteter, Kapabiliteter.arrangement.seTurnering) ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/${slug}/turnering/${arr.turneringId}`)}
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
  const slug = useSlug();
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
                slug={slug}
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
