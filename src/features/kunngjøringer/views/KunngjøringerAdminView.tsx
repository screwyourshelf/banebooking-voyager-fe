import { useState } from "react";
import { CircleAlert } from "lucide-react";
import {
  AdminFormActions,
  AdminFormSubmitButton,
  AdminPageLoading,
  AdminPageState,
  AdminSettingsForm,
  SettingsPanel,
  SettingsRow,
  SettingsSection,
  SettingsStack,
  SettingsText,
  SettingsValue,
} from "@/components/admin";
import { ServerFeil } from "@/components/errors";
import { RecordListState, RecordStatus, type RecordStatusTone } from "@/components/records";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useKunngjøringAdmin } from "@/features/kunngjøringer/hooks/useKunngjøringAdmin";

function formaterDato(value: string) {
  return new Date(value).toLocaleDateString("nb-NO");
}

function formaterTidspunkt(value: string) {
  return new Date(value).toLocaleString("nb-NO", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

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

  const canCreate = Boolean(tittel.trim() && tekst.trim() && utløper);

  const handleOpprett = async () => {
    const trimmetTittel = tittel.trim();
    const trimmetTekst = tekst.trim();
    if (!trimmetTittel || !trimmetTekst || !utløper) return;

    try {
      await opprett({
        tittel: trimmetTittel,
        tekst: trimmetTekst,
        utløperTidspunkt: new Date(utløper).toISOString(),
      });
      setTittel("");
      setTekst("");
      setUtløper("");
    } catch {
      // Feilen vises i skjemaets felles feilflate.
    }
  };

  const handleDeaktiver = async () => {
    if (!aktiv) return;

    try {
      await deaktiver(aktiv.id);
    } catch {
      // Feilen vises i fareområdets felles feilflate.
    }
  };

  if (laster) return <AdminPageLoading label="Laster kunngjøringer" />;

  if (error) {
    return (
      <AdminPageState>
        <RecordListState
          icon={<CircleAlert aria-hidden="true" />}
          title="Kunne ikke laste kunngjøringer"
          description={error.message}
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              {isFetching ? "Prøver igjen…" : "Prøv igjen"}
            </Button>
          }
          tone="danger"
          role="alert"
        />
      </AdminPageState>
    );
  }

  const bekreftelseTone: RecordStatusTone = !aktiv?.antallMålgruppe
    ? "past"
    : aktiv.antallBekreftelser >= aktiv.antallMålgruppe
      ? "available"
      : "warning";

  return (
    <SettingsStack>
      <SettingsSection
        eyebrow="Status"
        title={aktiv?.tittel ?? "Ingen aktiv kunngjøring"}
        description={
          aktiv
            ? "Kunngjøringen blokkerer brukere som ikke har bekreftet den."
            : "Brukerne kan bruke appen uten å bekrefte en kunngjøring."
        }
      >
        <SettingsPanel>
          <SettingsRow title="Status">
            <RecordStatus tone={aktiv ? "available" : "past"}>
              {aktiv ? "Aktiv" : "Ingen aktiv"}
            </RecordStatus>
          </SettingsRow>

          {aktiv ? (
            <>
              <SettingsRow title="Budskap">
                <SettingsText>{aktiv.tekst}</SettingsText>
              </SettingsRow>
              <SettingsRow title="Opprettet">
                <SettingsValue>{formaterDato(aktiv.opprettetTidspunkt)}</SettingsValue>
              </SettingsRow>
              <SettingsRow title="Utløper">
                <SettingsValue>{formaterDato(aktiv.utløperTidspunkt)}</SettingsValue>
              </SettingsRow>
            </>
          ) : null}
        </SettingsPanel>
      </SettingsSection>

      {aktiv ? (
        <>
          <SettingsSection
            eyebrow="Målgruppe"
            title="Bekreftelser"
            description="Se hvor mange brukere som har lest kunngjøringen."
          >
            <SettingsPanel>
              <SettingsRow title="Fremdrift">
                <RecordStatus tone={bekreftelseTone}>
                  {aktiv.antallBekreftelser} av {aktiv.antallMålgruppe} bekreftet
                </RecordStatus>
              </SettingsRow>

              {aktiv.bekreftelser.map((bekreftelse) => (
                <SettingsRow
                  key={bekreftelse.epost}
                  title={bekreftelse.visningsnavn}
                  description={bekreftelse.epost}
                >
                  <SettingsValue>{formaterTidspunkt(bekreftelse.bekreftetTidspunkt)}</SettingsValue>
                </SettingsRow>
              ))}
            </SettingsPanel>
          </SettingsSection>

          <SettingsSection
            eyebrow="Fareområde"
            title="Deaktiver kunngjøring"
            description="Brukere som ikke har bekreftet, blir ikke lenger blokkert."
            tone="danger"
          >
            <AdminFormActions>
              <ServerFeil feil={deaktiverFeil?.message ?? null} />
              <Button
                type="button"
                variant="destructive"
                onClick={() => void handleDeaktiver()}
                disabled={deaktiverLaster}
              >
                {deaktiverLaster ? "Deaktiverer…" : "Deaktiver kunngjøring"}
              </Button>
            </AdminFormActions>
          </SettingsSection>
        </>
      ) : (
        <AdminSettingsForm
          onSubmit={(event) => {
            event.preventDefault();
            void handleOpprett();
          }}
        >
          <SettingsSection
            eyebrow="Ny kunngjøring"
            title="Publiser viktig informasjon"
            description="Alle innloggede brukere må lese og bekrefte før de kan bruke appen."
          >
            <SettingsPanel>
              <SettingsRow title="Tittel" description="Kort overskrift for kunngjøringen.">
                <Field>
                  <Input
                    id="kunngjøring-tittel"
                    aria-label="Tittel"
                    value={tittel}
                    onChange={(event) => setTittel(event.target.value)}
                    placeholder="Viktig informasjon"
                    maxLength={200}
                    disabled={opprettLaster}
                  />
                </Field>
              </SettingsRow>

              <SettingsRow title="Budskap" description="Innholdet brukerne må lese og bekrefte.">
                <Field>
                  <Textarea
                    id="kunngjøring-tekst"
                    aria-label="Budskap"
                    value={tekst}
                    onChange={(event) => setTekst(event.target.value)}
                    placeholder="Skriv kunngjøringsteksten her…"
                    maxLength={5000}
                    rows={6}
                    disabled={opprettLaster}
                  />
                </Field>
              </SettingsRow>

              <SettingsRow title="Utløper" description="Dato kunngjøringen automatisk deaktiveres.">
                <Field>
                  <Input
                    id="kunngjøring-utløper"
                    aria-label="Utløpsdato"
                    type="date"
                    value={utløper}
                    onChange={(event) => setUtløper(event.target.value)}
                    disabled={opprettLaster}
                  />
                </Field>
              </SettingsRow>
            </SettingsPanel>

            <AdminFormActions>
              <ServerFeil feil={opprettFeil?.message ?? null} />
              <AdminFormSubmitButton
                isLoading={opprettLaster}
                disabled={!canCreate}
                loadingText="Aktiverer…"
              >
                Aktiver kunngjøring
              </AdminFormSubmitButton>
            </AdminFormActions>
          </SettingsSection>
        </AdminSettingsForm>
      )}
    </SettingsStack>
  );
}
