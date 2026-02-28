import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row } from "@/components/rows";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  return (
    <div className="space-y-4">
      <PageSection
        title="Brukere"
        description="Søk etter brukere og endre rolle eller visningsnavn."
      >
        <RowPanel>
          <RowList>
            <Row title="Filter på rolle" description="">
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
                      className="h-8 px-3"
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

            <Row title="Søk" description="">
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
            <Accordion type="single" collapsible className="rounded-md border bg-background">
              {filtrerteBrukere.map((b) => {
                const slettet = erSlettetEpost(b.epost);
                const rolle = (b.roller?.[0] ?? "Medlem") as RolleType;
                const kanRedigere = b.id !== currentBrukerId && !slettet;

                return (
                  <AccordionItem
                    key={b.id}
                    value={b.id}
                    className={`px-4 ${slettet ? "opacity-60" : ""}`}
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
                      <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="flex items-start gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                              <div className="text-xs font-medium text-muted-foreground">
                                E-post
                              </div>
                              <div className="text-sm">{b.epost ?? "Ukjent"}</div>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                              <div className="text-xs font-medium text-muted-foreground">
                                Visningsnavn
                              </div>
                              <div className="text-sm">
                                {b.visningsnavn || (
                                  <span className="text-muted-foreground italic">Ikke satt</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 sm:col-span-2">
                            <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                              <div className="text-xs font-medium text-muted-foreground">Rolle</div>
                              <div className="text-sm">{rolle}</div>
                            </div>
                          </div>
                        </div>

                        {kanRedigere && (
                          <div className="flex justify-end pt-2 border-t">
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
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>
      </PageSection>
    </div>
  );
}
