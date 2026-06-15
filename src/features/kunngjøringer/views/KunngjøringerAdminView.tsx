import { useState } from "react";
import { FormSkeleton } from "@/components/loading";
import { QueryFeil, ServerFeil } from "@/components/errors";
import { Stack } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row } from "@/components/rows";
import InfoRow from "@/components/rows/InfoRow";
import { useKunngjøringAdmin } from "@/features/kunngjøringer/hooks/useKunngjøringAdmin";

export default function KunngjøringerAdminView() {
  const {
    aktiv,
    laster,
    isFetching,
    error,
    refetch,
    opprett,
    opprettLaster,
    opprettFeil,
    deaktiver,
    deaktiverLaster,
    deaktiverFeil,
  } = useKunngjøringAdmin();

  const [tittel, setTittel] = useState("");
  const [tekst, setTekst] = useState("");
  const [utløper, setUtløper] = useState("");

  const handleOpprett = async () => {
    const trimmetTittel = tittel.trim();
    const trimmetTekst = tekst.trim();
    if (!trimmetTittel || !trimmetTekst || !utløper) return;
    await opprett({
      tittel: trimmetTittel,
      tekst: trimmetTekst,
      utløperTidspunkt: new Date(utløper).toISOString(),
    });
    setTittel("");
    setTekst("");
    setUtløper("");
  };

  const handleDeaktiver = async () => {
    if (!aktiv) return;
    await deaktiver(aktiv.id);
  };

  if (laster) return <FormSkeleton />;

  return (
    <QueryFeil error={error} isFetching={isFetching} onRetry={() => void refetch()}>
      <Stack gap="lg">
        {/* STATUS */}
        <PageSection title="Status" description="Oversikt over gjeldende kunngjøring.">
          <RowPanel>
            <RowList>
              <InfoRow
                label="Aktiv kunngjøring"
                value={
                  aktiv ? (
                    <Badge variant="default">{aktiv.tittel}</Badge>
                  ) : (
                    <span className="italic">Ingen aktiv kunngjøring</span>
                  )
                }
              />
              {aktiv && (
                <>
                  <InfoRow
                    label="Tekst"
                    value={<span className="whitespace-pre-wrap">{aktiv.tekst}</span>}
                  />
                  <InfoRow
                    label="Utløper"
                    value={new Date(aktiv.utløperTidspunkt).toLocaleDateString("nb-NO")}
                  />
                  <InfoRow
                    label="Bekreftet"
                    value={`${aktiv.antallBekreftelser} av ${aktiv.antallMålgruppe} brukere`}
                  />
                  {aktiv.bekreftelser.length > 0 && (
                    <InfoRow
                      label="Hvem har bekreftet"
                      value={
                        <ul className="space-y-0.5 text-sm">
                          {aktiv.bekreftelser.map((b) => (
                            <li key={b.epost} className="flex gap-2">
                              <span>{b.visningsnavn}</span>
                              <span className="text-muted-foreground">
                                {new Date(b.bekreftetTidspunkt).toLocaleString("nb-NO", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })}
                              </span>
                            </li>
                          ))}
                        </ul>
                      }
                    />
                  )}
                </>
              )}
            </RowList>
          </RowPanel>
        </PageSection>

        {/* OPPRETT NY */}
        {!aktiv && (
          <PageSection
            title="Opprett kunngjøring"
            description="Alle innloggede brukere må bekrefte kunngjøringen før de kan bruke appen."
          >
            <RowPanel>
              <RowList>
                <Row title="Tittel" description="Kort overskrift for kunngjøringen.">
                  <Field>
                    <Input
                      id="kunngjøring-tittel"
                      value={tittel}
                      onChange={(e) => setTittel(e.target.value)}
                      placeholder="Viktig informasjon"
                      maxLength={200}
                      className="bg-background"
                    />
                  </Field>
                </Row>

                <Row title="Tekst" description="Innholdet som brukeren må lese og bekrefte.">
                  <Field>
                    <Textarea
                      id="kunngjøring-tekst"
                      value={tekst}
                      onChange={(e) => setTekst(e.target.value)}
                      placeholder="Skriv kunngjøringsteksten her…"
                      maxLength={5000}
                      rows={5}
                      className="bg-background"
                    />
                  </Field>
                </Row>

                <Row title="Utløper" description="Dato kunngjøringen automatisk deaktiveres.">
                  <Field>
                    <Input
                      id="kunngjøring-utløper"
                      type="date"
                      value={utløper}
                      onChange={(e) => setUtløper(e.target.value)}
                      className="bg-background"
                    />
                  </Field>
                </Row>
              </RowList>
            </RowPanel>

            <ServerFeil feil={opprettFeil?.message ?? null} />

            <div className="flex justify-end mt-2">
              <Button
                onClick={() => void handleOpprett()}
                disabled={opprettLaster || !tittel.trim() || !tekst.trim() || !utløper}
              >
                {opprettLaster ? "Aktiverer…" : "Aktiver kunngjøring"}
              </Button>
            </div>
          </PageSection>
        )}

        {/* DEAKTIVER */}
        {aktiv && (
          <PageSection
            title="Deaktiver"
            description="Fjerner kunngjøringen. Brukere som ikke har bekreftet vil ikke lenger bli blokkert."
          >
            <ServerFeil feil={deaktiverFeil?.message ?? null} />

            <div className="flex justify-end">
              <Button
                variant="destructive"
                onClick={() => void handleDeaktiver()}
                disabled={deaktiverLaster}
              >
                {deaktiverLaster ? "Deaktiverer…" : "Deaktiver kunngjøring"}
              </Button>
            </div>
          </PageSection>
        )}
      </Stack>
    </QueryFeil>
  );
}
