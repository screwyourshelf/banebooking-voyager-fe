import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row } from "@/components/rows";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";

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
  onNullstillRolleFilter: () => void;

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
  onNullstillRolleFilter,
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

              {rolleFilter.length > 0 ? (
                <div className="mt-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={onNullstillRolleFilter}
                    className="h-8 px-2 text-muted-foreground"
                  >
                    Nullstill filter
                  </Button>
                </div>
              ) : null}
            </Row>

            <Row
              title="Vis slettede brukere"
              description="Inkluder brukere som er anonymisert eller slettet."
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
            <RowPanel>
              <RowList>
                {filtrerteBrukere.map((b) => {
                  const erMeg = b.id === currentBrukerId;
                  const slettet = erSlettetEpost(b.epost);
                  const rolle = (b.roller?.[0] ?? "Medlem") as RolleType;

                  return (
                    <Row
                      key={b.id}
                      title={b.epost ?? "Ukjent bruker"}
                      description={b.visningsnavn || (slettet ? "Slettet/anonymisert" : "")}
                      right={
                        !erMeg && !slettet ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => onRedigerBruker(b)}
                          >
                            Rediger
                          </Button>
                        ) : null
                      }
                      className={cn(slettet && "opacity-70")}
                    >
                      <div className="text-sm text-foreground">
                        <span className="text-muted-foreground">Rolle: </span>
                        {rolle}
                        {slettet ? <span className="text-muted-foreground"> (slettet)</span> : null}
                      </div>
                    </Row>
                  );
                })}
              </RowList>
            </RowPanel>
          )}
        </div>
      </PageSection>
    </div>
  );
}
