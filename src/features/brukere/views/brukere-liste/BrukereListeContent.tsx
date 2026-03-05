import { useState, useEffect } from "react";
import PageSection from "@/components/sections/PageSection";
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
import { Mail, User, Shield } from "lucide-react";

import type { BrukerRespons, RolleType } from "@/features/brukere/types";
import { ROLLER } from "@/features/brukere/types";

type Props = {
  // Filter state
  query: string;
  onQueryChange: (value: string) => void;
  visSlettede: boolean;
  onVisSlettedeChange: (value: boolean) => void;
  rolleFilter: RolleType[];
  onToggleRolle: (rolle: RolleType) => void;

  // Liste
  filtrerteBrukere: BrukerRespons[];
  lasterListe: boolean;
  currentBrukerId: string | undefined;

  // Actions
  onRedigerBruker: (bruker: BrukerRespons) => void;
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
  filtrerteBrukere,
  lasterListe,
  currentBrukerId,
  onRedigerBruker,
}: Props) {
  const PAGE_SIZE = 20;
  const [synligAntall, setSynligAntall] = useState(PAGE_SIZE);

  useEffect(() => {
    setSynligAntall(PAGE_SIZE);
  }, [query, visSlettede, rolleFilter]);

  const synligeBrukere = filtrerteBrukere.slice(0, synligAntall);
  const harFlere = synligAntall < filtrerteBrukere.length;

  return (
    <div className="space-y-4">
      <PageSection
        title="Brukere"
        description="Søk etter brukere og endre rolle eller visningsnavn."
      >
        <RowPanel>
          <RowList>
            <Row title="Filter på rolle">
              <div className="flex flex-wrap gap-2">
                {ROLLER.map((r) => {
                  const aktiv = rolleFilter.includes(r);
                  return (
                    <Button
                      key={r}
                      type="button"
                      size="sm"
                      variant={aktiv ? "default" : "outline"}
                      onClick={() => onToggleRolle(r)}
                    >
                      {r}
                    </Button>
                  );
                })}
              </div>
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
                        <div className="flex flex-col items-start gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{b.epost ?? "Ukjent bruker"}</span>
                            {slettet && (
                              <Badge variant="outline" className="text-xs">
                                Slettet
                              </Badge>
                            )}
                          </div>
                          {b.visningsnavn && (
                            <span className="text-xs text-muted-foreground">{b.visningsnavn}</span>
                          )}
                        </div>
                      </AccordionTrigger>

                      <AccordionContent>
                        <div className="space-y-3">
                          <AccordionDetailGrid>
                            <AccordionDetailRow icon={Mail} label="E-post">
                              {b.epost ?? "Ukjent"}
                            </AccordionDetailRow>

                            <AccordionDetailRow icon={User} label="Visningsnavn">
                              {b.visningsnavn || (
                                <span className="text-muted-foreground italic">Ikke satt</span>
                              )}
                            </AccordionDetailRow>

                            <AccordionDetailRow icon={Shield} label="Rolle" colSpan={2}>
                              {rolle}
                            </AccordionDetailRow>
                          </AccordionDetailGrid>

                          {kanRedigere && (
                            <AccordionActions>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRedigerBruker(b);
                                }}
                              >
                                Rediger
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
                    Vis flere ({filtrerteBrukere.length - synligAntall} gjenstår)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </PageSection>
    </div>
  );
}
