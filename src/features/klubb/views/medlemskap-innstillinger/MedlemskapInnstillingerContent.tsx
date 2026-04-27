import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row } from "@/components/rows";
import InfoRow from "@/components/rows/InfoRow";
import { Stack } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ServerFeil } from "@/components/errors";
import type { MedlemskapStatusRespons } from "@/types";

type Props = {
  status: MedlemskapStatusRespons | null;
  label: string;
  onLabelChange: (value: string) => void;
  gyldigTil: string;
  onGyldigTilChange: (value: string) => void;
  onAktiver: () => void;
  aktiverLaster: boolean;
  aktiverFeil: string | null;
  onDeaktiver: () => void;
  deaktiverLaster: boolean;
  deaktiverFeil: string | null;
};

export default function MedlemskapInnstillingerContent({
  status,
  label,
  onLabelChange,
  gyldigTil,
  onGyldigTilChange,
  onAktiver,
  aktiverLaster,
  aktiverFeil,
  onDeaktiver,
  deaktiverLaster,
  deaktiverFeil,
}: Props) {
  const harAktiv = !!status?.aktivBekreftelse;

  return (
    <Stack gap="lg">
      {/* STATUS */}
      <PageSection title="Status" description="Oversikt over gjeldende bekreftelsesperiode.">
        <RowPanel>
          <RowList>
            <InfoRow
              label="Aktiv bekreftelse"
              value={
                harAktiv ? (
                  <Badge
                    variant="outline"
                    className="text-emerald-600 border-emerald-600/30 dark:text-emerald-400 dark:border-emerald-400/30"
                  >
                    {status!.aktivBekreftelse!.label}
                  </Badge>
                ) : (
                  <span className="italic">Ingen aktiv bekreftelse</span>
                )
              }
            />

            {harAktiv && (
              <>
                <InfoRow
                  label="Periode"
                  value={`Aktiv siden ${new Date(status!.aktivBekreftelse!.opprettetTidspunkt).toLocaleDateString("nb-NO")} — gyldig til ${new Date(status!.aktivBekreftelse!.gyldigTil).toLocaleDateString("nb-NO")}`}
                />
                <InfoRow
                  label="Bekreftet"
                  value={`${status!.antallBekreftet} av ${status!.antallTotalt} medlemmer`}
                />
              </>
            )}
          </RowList>
        </RowPanel>
      </PageSection>

      {/* AKTIVER NY */}
      {!harAktiv && (
        <PageSection
          title="Aktiver bekreftelse"
          description="Opprett en ny bekreftelsesperiode. Alle medlemmer må bekrefte sitt medlemskap."
        >
          <RowPanel>
            <RowList>
              <Row title="Periodenavn" description='F.eks. "Sesong 2026" eller "Høst 2026"'>
                <Field>
                  <Input
                    id="medlemskap-label"
                    value={label}
                    onChange={(e) => onLabelChange(e.target.value)}
                    placeholder="Sesong 2026"
                    maxLength={100}
                    className="bg-background"
                  />
                </Field>
              </Row>

              <Row title="Gyldig til" description="Dato bekreftelsesperioden utløper.">
                <Field>
                  <Input
                    id="medlemskap-gyldig-til"
                    type="date"
                    value={gyldigTil}
                    onChange={(e) => onGyldigTilChange(e.target.value)}
                    className="bg-background"
                  />
                </Field>
              </Row>
            </RowList>
          </RowPanel>

          <ServerFeil feil={aktiverFeil} />

          <div className="flex justify-end mt-2">
            <Button
              onClick={() => void onAktiver()}
              disabled={aktiverLaster || !label.trim() || !gyldigTil}
            >
              {aktiverLaster ? "Aktiverer…" : "Aktiver bekreftelse"}
            </Button>
          </div>
        </PageSection>
      )}

      {/* DEAKTIVER */}
      {harAktiv && (
        <PageSection
          title="Deaktiver"
          description="Fjerner kravet om at medlemmer må bekrefte. Eksisterende bekreftelser beholdes."
        >
          <ServerFeil feil={deaktiverFeil} />

          <div className="flex justify-end">
            <Button
              variant="destructive"
              onClick={() => void onDeaktiver()}
              disabled={deaktiverLaster}
            >
              {deaktiverLaster ? "Deaktiverer…" : "Deaktiver bekreftelse"}
            </Button>
          </div>
        </PageSection>
      )}
    </Stack>
  );
}
