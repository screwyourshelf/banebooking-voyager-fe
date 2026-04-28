import { usePagination } from "@/hooks/usePagination";
import PageSection from "@/components/sections/PageSection";
import { Stack, Inline } from "@/components/layout";
import { RowPanel, RowList, Row } from "@/components/rows";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AccordionDetailGrid, AccordionDetailRow, AccordionActions } from "@/components/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { User, Shield, Ban, BadgeCheck, Clock, UserCheck, Tag, CalendarDays } from "lucide-react";

import type { BrukerRespons, RolleType, MedlemskapFilterType } from "@/features/brukere/types";
import { ROLLER, MEDLEMSKAP_FILTER_VALG } from "@/features/brukere/types";
import type { ReactNode } from "react";

const MEDLEMSKAP_TYPE_LABELS: Record<string, string> = {
  BarnJunior: "Barn/junior (inntil 19 år)",
  StudentVernepliktig: "Student/vernepliktig",
  Voksen: "Voksen",
  Familie: "Familiemedlemskap",
};

type Props = {
  // Filter state
  query: string;
  onQueryChange: (value: string) => void;
  visSlettede: boolean;
  onVisSlettedeChange: (value: boolean) => void;
  rolleFilter: RolleType[];
  onToggleRolle: (rolle: RolleType) => void;
  medlemskapFilter: MedlemskapFilterType[];
  onToggleMedlemskap: (filter: MedlemskapFilterType) => void;

  // Liste
  filtrerteBrukere: BrukerRespons[];
  lasterListe: boolean;
  currentBrukerId: string | undefined;
  erKlubbAdmin: boolean;

  // Actions
  onRedigerBruker: (bruker: BrukerRespons) => void;
  renderSlettAction?: (bruker: BrukerRespons) => ReactNode;
  renderSperrAction?: (bruker: BrukerRespons) => ReactNode;
  onÅpneSperreHistorikk?: (bruker: BrukerRespons) => void;
};

function erSlettetEpost(epost?: string | null) {
  if (!epost) return false;
  return epost.toLowerCase().startsWith("slettet_");
}

export default function BrukereListeContent({
  query,
  onQueryChange,
  visSlettede,
  onVisSlettedeChange,
  rolleFilter,
  onToggleRolle,
  medlemskapFilter,
  onToggleMedlemskap,
  filtrerteBrukere,
  lasterListe,
  currentBrukerId,
  erKlubbAdmin,
  onRedigerBruker,
  renderSlettAction,
  renderSperrAction,
  onÅpneSperreHistorikk,
}: Props) {
  const filterKey = `${query}|${visSlettede}|${rolleFilter.join(",")}|${medlemskapFilter.join(",")}`;
  const {
    synlige: synligeBrukere,
    harFlere,
    gjenstaar,
    visFlere,
  } = usePagination(filtrerteBrukere, 20, filterKey);

  return (
    <Stack gap="lg">
      <PageSection
        title="Brukere"
        description="Søk etter brukere og endre rolle eller visningsnavn."
      >
        <RowPanel>
          <RowList>
            <Row title="Filter på rolle">
              <Inline gap="md" wrap>
                {ROLLER.map((r) => {
                  const aktiv = rolleFilter.includes(r);
                  return (
                    <Button
                      key={r}
                      type="button"
                      aria-label="Filter på rolle"
                      size="sm"
                      variant={aktiv ? "default" : "outline"}
                      onClick={() => onToggleRolle(r)}
                    >
                      {r}
                    </Button>
                  );
                })}
              </Inline>
            </Row>

            <Row title="Filter på medlemskap">
              <Inline gap="md" wrap>
                {MEDLEMSKAP_FILTER_VALG.map((m) => {
                  const aktiv = medlemskapFilter.includes(m.value);
                  return (
                    <Button
                      key={m.value}
                      type="button"
                      aria-label="Filter på medlemskap"
                      size="sm"
                      variant={aktiv ? "default" : "outline"}
                      onClick={() => onToggleMedlemskap(m.value)}
                    >
                      {m.label}
                    </Button>
                  );
                })}
              </Inline>
            </Row>

            <Row
              title="Inkluder slettede brukere"
              right={<Switch checked={visSlettede} onCheckedChange={onVisSlettedeChange} />}
            />

            <Row title="Søk">
              <Field>
                <Input
                  id="brukersok"
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="Søk på e-post eller visningsnavn…"
                  inputMode="search"
                  className="bg-background"
                />
              </Field>
            </Row>
          </RowList>
        </RowPanel>

        {/* RESULTATLISTE */}
        <div className="mt-4">
          {lasterListe ? (
            <p className="text-sm text-muted-foreground">Laster brukere…</p>
          ) : filtrerteBrukere.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Ingen brukere funnet.</p>
          ) : (
            <>
              <Accordion type="single" collapsible className="space-y-1">
                {synligeBrukere.map((b) => {
                  const slettet = erSlettetEpost(b.epost);
                  const rolle = (b.roller?.[0] ?? "Medlem") as RolleType;
                  const kanRedigere = b.id !== currentBrukerId && !slettet;

                  return (
                    <AccordionItem
                      key={b.id}
                      value={b.id}
                      className={`rounded-md border bg-background px-2 last:border-b shadow-sm ${slettet ? "opacity-60" : ""}`}
                    >
                      <AccordionTrigger className="hover:no-underline">
                        <Stack gap="xs" className="items-start">
                          <Inline gap="md">
                            <span className="font-medium">{b.epost ?? "Ukjent bruker"}</span>
                            {slettet && (
                              <Badge variant="outline" className="text-xs">
                                Slettet
                              </Badge>
                            )}
                            {b.erSperret && (
                              <Badge variant="destructive" className="text-xs">
                                Sperret
                              </Badge>
                            )}
                            {b.medlemskapBekreftetDato ? (
                              <Badge
                                variant="outline"
                                className="text-xs text-emerald-600 border-emerald-600/30 dark:text-emerald-400 dark:border-emerald-400/30"
                              >
                                Bekreftet
                              </Badge>
                            ) : b.måBekrefteMedlemskap ? (
                              <Badge
                                variant="outline"
                                className="text-xs text-amber-600 border-amber-600/30 dark:text-amber-400 dark:border-amber-400/30"
                              >
                                Ikke bekreftet
                              </Badge>
                            ) : null}
                          </Inline>
                          {b.visningsnavn && (
                            <span className="text-xs text-muted-foreground">{b.visningsnavn}</span>
                          )}
                        </Stack>
                      </AccordionTrigger>

                      <AccordionContent>
                        <Stack gap="sm">
                          <AccordionDetailGrid>
                            {b.opprettetTid && (
                              <AccordionDetailRow icon={CalendarDays} label="Opprettet">
                                {new Date(b.opprettetTid).toLocaleDateString("nb-NO")}
                              </AccordionDetailRow>
                            )}

                            <AccordionDetailRow icon={User} label="Visningsnavn">
                              {b.visningsnavn || (
                                <span className="text-muted-foreground italic">Ikke satt</span>
                              )}
                            </AccordionDetailRow>

                            <AccordionDetailRow icon={Shield} label="Rolle" colSpan={2}>
                              {rolle}
                            </AccordionDetailRow>

                            <AccordionDetailRow
                              icon={b.medlemskapBekreftetDato ? BadgeCheck : Clock}
                              label="Medlemskap"
                              colSpan={2}
                            >
                              {b.medlemskapBekreftetDato ? (
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  Bekreftet{" "}
                                  {new Date(b.medlemskapBekreftetDato).toLocaleDateString("nb-NO")}
                                </span>
                              ) : b.måBekrefteMedlemskap ? (
                                <span className="text-amber-600 dark:text-amber-400">
                                  Ikke bekreftet
                                </span>
                              ) : (
                                <span className="text-muted-foreground italic">
                                  Ingen aktiv bekreftelse
                                </span>
                              )}
                            </AccordionDetailRow>

                            {b.fulltNavn && (
                              <AccordionDetailRow
                                icon={UserCheck}
                                label="Navn (medlemskap)"
                                colSpan={2}
                              >
                                {b.fulltNavn}
                              </AccordionDetailRow>
                            )}

                            {b.medlemskapType && (
                              <AccordionDetailRow icon={Tag} label="Type medlemskap" colSpan={2}>
                                {MEDLEMSKAP_TYPE_LABELS[b.medlemskapType] ?? b.medlemskapType}
                              </AccordionDetailRow>
                            )}

                            {b.antallAktiveSperrer !== undefined && (
                              <AccordionDetailRow icon={Ban} label="Aktive sperrer" colSpan={2}>
                                {onÅpneSperreHistorikk ? (
                                  <button
                                    type="button"
                                    className="hover:underline underline-offset-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onÅpneSperreHistorikk(b);
                                    }}
                                  >
                                    {b.antallAktiveSperrer === 0 ? (
                                      <span className="text-muted-foreground italic">Ingen</span>
                                    ) : (
                                      <span className="text-destructive">
                                        {b.antallAktiveSperrer}
                                      </span>
                                    )}
                                  </button>
                                ) : b.antallAktiveSperrer === 0 ? (
                                  <span className="text-muted-foreground italic">Ingen</span>
                                ) : (
                                  <span className="text-destructive">{b.antallAktiveSperrer}</span>
                                )}
                              </AccordionDetailRow>
                            )}
                          </AccordionDetailGrid>

                          {kanRedigere && erKlubbAdmin && (
                            <AccordionActions className="flex-wrap gap-2">
                              {renderSlettAction?.(b)}
                              {renderSperrAction?.(b)}

                              <Button
                                type="button"
                                aria-label="Rediger bruker"
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRedigerBruker(b);
                                }}
                                className="flex items-center gap-2 text-sm"
                              >
                                Rediger
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
                  <Button variant="outline" size="sm" onClick={visFlere}>
                    Vis flere ({gjenstaar} gjenstår)
                  </Button>
                </Inline>
              )}
            </>
          )}
        </div>
      </PageSection>
    </Stack>
  );
}
