import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDatoKort, formatDayOfWeeksLangNorsk, dagerIgjenTekst } from "@/utils/datoUtils";
import {
  Calendar,
  Clock,
  Link,
  MapPin,
  Users,
  UserCheck,
  CalendarPlus,
  XCircle,
  Ban,
  Trophy,
  Settings,
} from "lucide-react";
import { SlettArrangementDialog } from "@/features/arrangement-admin/components";
import PaameldteDialog from "./PaameldteDialog";
import { useSlug } from "@/hooks/useSlug";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";
import { toast } from "sonner";
import type { ArrangementRespons } from "@/types";

type Props = {
  visHistoriske: boolean;
  onToggleVisHistoriske: (value: boolean) => void;

  arrangementer: ArrangementRespons[];
  onMeldPaa: (arr: ArrangementRespons) => void;
  onMeldAv: (arr: ArrangementRespons) => void;
  onAvlys: (arr: ArrangementRespons) => Promise<unknown>;
  defaultArrangementId?: string;
};

const TURNERING_STATUS_TEKST: Record<string, string> = {
  Oppsett: "Påmelding åpner snart",
  PaameldingAapen: "Påmelding åpen",
  PaameldingLukket: "Påmelding lukket",
  DrawPublisert: "Draw publisert",
  Pagaar: "Turnering pågår",
  Avsluttet: "Avsluttet",
};

function datoTekst(arr: ArrangementRespons) {
  return arr.startDato === arr.sluttDato
    ? formatDatoKort(arr.startDato)
    : `${formatDatoKort(arr.startDato)} – ${formatDatoKort(arr.sluttDato)}`;
}

export default function ArrangementerContent({
  visHistoriske,
  onToggleVisHistoriske,
  arrangementer,
  onMeldPaa,
  onMeldAv,
  onAvlys,
  defaultArrangementId,
}: Props) {
  const slug = useSlug();
  const navigate = useNavigate();
  const PAGE_SIZE = 10;
  const [synligAntall, setSynligAntall] = useState(PAGE_SIZE);

  useEffect(() => {
    setSynligAntall(PAGE_SIZE);
  }, [visHistoriske]);

  function kopierLenke(arrangementId: string) {
    const url = `${window.location.origin}/${slug}/arrangementer?arrangement=${arrangementId}`;
    void navigator.clipboard.writeText(url).then(() => {
      toast.success("Lenke kopiert til utklippstavle");
    });
  }

  const synligeArrangementer = arrangementer.slice(0, synligAntall);
  const harFlere = synligAntall < arrangementer.length;

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
          <Accordion
            type="single"
            collapsible
            className="space-y-1 mt-2"
            defaultValue={defaultArrangementId}
          >
            {synligeArrangementer.map((arr) => {
              const beskrivelse = arr.beskrivelse?.trim() ?? "";
              const harBeskrivelse = beskrivelse.length > 0;
              const harGrupper = (arr.baneGrupper?.length ?? 0) > 0;
              const harUkedager = (arr.ukedager?.length ?? 0) > 0;
              const erFlereGrupper = (arr.baneGrupper?.length ?? 0) > 1;

              return (
                <AccordionItem
                  key={arr.id}
                  value={arr.id}
                  className={`rounded-md border bg-background px-2 last:border-b shadow-sm ${arr.erPassert ? "opacity-50" : ""}`}
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-col items-start gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{arr.tittel}</span>
                        {arr.erPassert ? (
                          <Badge variant="outline" className="text-xs">
                            Gjennomført
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            {dagerIgjenTekst(arr.startDato)}
                          </Badge>
                        )}
                        {arr.tillaterPaamelding && arr.erPaameldt && (
                          <span className="text-green-600" title="Du er påmeldt">
                            <UserCheck className="size-4" />
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{datoTekst(arr)}</span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent>
                    <div className="space-y-3">
                      {harBeskrivelse && (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {beskrivelse}
                        </p>
                      )}

                      <AccordionDetailGrid>
                        {harGrupper && !erFlereGrupper && (
                          <>
                            <AccordionDetailRow icon={MapPin} label="Baner">
                              {arr.baneGrupper[0].baneNavn.join(", ")}
                            </AccordionDetailRow>

                            {arr.baneGrupper[0].tidspunkter.length > 0 && (
                              <AccordionDetailRow icon={Clock} label="Tidspunkter" colSpan={2}>
                                {arr.baneGrupper[0].tidspunkter.join(", ")}
                                <span className="text-muted-foreground">
                                  {" "}
                                  ({arr.baneGrupper[0].slotLengdeMinutter} min)
                                </span>
                              </AccordionDetailRow>
                            )}
                          </>
                        )}

                        {erFlereGrupper &&
                          arr.baneGrupper.map((gruppe, idx) => (
                            <AccordionDetailRow
                              key={idx}
                              icon={MapPin}
                              label={gruppe.baneNavn.join(", ")}
                              colSpan={2}
                            >
                              {gruppe.tidspunkter.join(", ")}
                              <span className="text-muted-foreground">
                                {" "}
                                ({gruppe.slotLengdeMinutter} min)
                              </span>
                            </AccordionDetailRow>
                          ))}

                        {harUkedager && (
                          <AccordionDetailRow icon={Calendar} label="Ukedager">
                            {formatDayOfWeeksLangNorsk(arr.ukedager)}
                          </AccordionDetailRow>
                        )}
                        {arr.tillaterPaamelding && (
                          <AccordionDetailRow
                            icon={Users}
                            label="Påmeldte"
                            iconClassName={arr.erPaameldt ? "text-green-600" : undefined}
                          >
                            <PaameldteDialog arrangementId={arr.id} tittel={arr.tittel}>
                              <button
                                type="button"
                                aria-label="Påmeldte"
                                className="underline underline-offset-2 hover:text-foreground transition-colors"
                              >
                                {arr.antallPaameldte} påmeldt
                              </button>
                            </PaameldteDialog>
                          </AccordionDetailRow>
                        )}
                        {arr.turneringStatus !== null && (
                          <AccordionDetailRow icon={Trophy} label="Turnering" colSpan={2}>
                            {TURNERING_STATUS_TEKST[arr.turneringStatus] ?? arr.turneringStatus}
                          </AccordionDetailRow>
                        )}
                      </AccordionDetailGrid>

                      {(harHandling(arr.kapabiliteter, Kapabiliteter.arrangement.seTurnering) ||
                        harHandling(
                          arr.kapabiliteter,
                          Kapabiliteter.arrangement.administrerTurnering
                        ) ||
                        (!arr.erPassert &&
                          (harHandling(arr.kapabiliteter, Kapabiliteter.arrangement.kopierLenke) ||
                            harHandling(arr.kapabiliteter, Kapabiliteter.arrangement.avlys) ||
                            harHandling(arr.kapabiliteter, Kapabiliteter.arrangement.meldAv) ||
                            harHandling(
                              arr.kapabiliteter,
                              Kapabiliteter.arrangement.meldPaa
                            )))) && (
                        <AccordionActions className="flex-wrap gap-2">
                          {harHandling(
                            arr.kapabiliteter,
                            Kapabiliteter.arrangement.administrerTurnering
                          ) ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/${slug}/turnering/${arr.turneringId}`)}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Settings className="h-4 w-4" />
                              Administrer turnering
                            </Button>
                          ) : harHandling(
                              arr.kapabiliteter,
                              Kapabiliteter.arrangement.seTurnering
                            ) ? (
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
                            harHandling(
                              arr.kapabiliteter,
                              Kapabiliteter.arrangement.kopierLenke
                            ) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => kopierLenke(arr.id)}
                                className="flex items-center gap-2 text-sm"
                              >
                                <Link className="h-4 w-4" />
                                Kopier lenke
                              </Button>
                            )}
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
                          {!arr.erPassert &&
                            harHandling(arr.kapabiliteter, Kapabiliteter.arrangement.meldAv) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onMeldAv(arr)}
                                className="flex items-center gap-2 text-sm"
                              >
                                <XCircle className="size-4" />
                                Meld meg av
                              </Button>
                            )}
                          {!arr.erPassert &&
                            harHandling(arr.kapabiliteter, Kapabiliteter.arrangement.meldPaa) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onMeldPaa(arr)}
                                className="flex items-center gap-2 text-sm"
                              >
                                <CalendarPlus className="size-4" />
                                Meld meg på
                              </Button>
                            )}
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
                Vis flere ({arrangementer.length - synligAntall} gjenstår)
              </Button>
            </div>
          )}
        </>
      )}
    </PageSection>
  );
}
