import { useState } from "react";
import { CircleAlert } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import {
  AdminFormActions,
  AdminFormSubmitButton,
  AdminPage,
  AdminPageLoading,
  AdminPageState,
  AdminSettingsForm,
  SettingsPanel,
  SettingsRadioGroup,
  SettingsRow,
  SettingsSection,
} from "@/components/admin";
import { ServerFeil } from "@/components/errors";
import { ContentDocument, ContentDocumentIntro } from "@/components/layout";
import { RecordListState, RecordStatus } from "@/components/records";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useBekreftMedlemskap } from "@/hooks/useBekreftMedlemskap";
import { useBruker } from "@/hooks/useBruker";
import { useKlubb } from "@/hooks/useKlubb";

const MEDLEMSKAP_TYPER = [
  { value: "BarnJunior", label: "Barn/junior (inntil 19 år)" },
  { value: "StudentVernepliktig", label: "Student/vernepliktig" },
  { value: "Voksen", label: "Voksen" },
  { value: "Familie", label: "Familiemedlemskap" },
] as const;

export default function BekreftMedlemskapPage() {
  const {
    data: klubb,
    isLoading: lasterKlubb,
    error: klubbFeil,
    refetch: refetchKlubb,
  } = useKlubb();
  const { bruker, laster: lasterBruker, feil: brukerFeil, refetch: refetchBruker } = useBruker();
  const { bekreft, laster, vellykket, feil } = useBekreftMedlemskap();

  const [fulltNavn, setFulltNavn] = useState("");
  const [medlemskapType, setMedlemskapType] = useState("");

  if (lasterKlubb || lasterBruker) {
    return (
      <AdminPage
        eyebrow="Medlemskap"
        title="Bekreft medlemskap"
        description="Laster medlemskapsinformasjon fra klubben."
      >
        <AdminPageLoading label="Laster medlemskapsbekreftelse" />
      </AdminPage>
    );
  }

  if (klubbFeil || brukerFeil || !klubb) {
    return (
      <AdminPage
        eyebrow="Medlemskap"
        title="Bekreft medlemskap"
        description="Informasjonen må lastes før du kan bekrefte medlemskapet."
      >
        <AdminPageState>
          <RecordListState
            icon={<CircleAlert aria-hidden="true" />}
            title="Kunne ikke laste medlemskapsinformasjonen"
            description={klubbFeil?.message ?? brukerFeil ?? "Prøv igjen om litt."}
            action={
              <Button
                type="button"
                variant="outline"
                onClick={() => void Promise.all([refetchKlubb(), refetchBruker()])}
              >
                Prøv igjen
              </Button>
            }
            tone="danger"
            role="alert"
          />
        </AdminPageState>
      </AdminPage>
    );
  }

  if (!bruker?.måBekrefteMedlemskap && vellykket) {
    return <Navigate to=".." replace />;
  }

  const kanBekrefte = fulltNavn.trim().length > 0 && medlemskapType.length > 0;

  const handleSubmit = async () => {
    if (!kanBekrefte || laster || vellykket) return;

    try {
      await bekreft({ fulltNavn: fulltNavn.trim(), medlemskapType });
    } catch {
      // Feilen vises i skjemaets felles feilflate.
    }
  };

  return (
    <AdminPage
      eyebrow="Medlemskap"
      title="Bekreft medlemskap"
      description="Bekreft at medlemskapet ditt er betalt for gjeldende sesong."
      action={
        <RecordStatus tone="warning">
          {bruker?.medlemskapBekreftelseLabel ?? "Må bekreftes"}
        </RecordStatus>
      }
    >
      <ContentDocument>
        <ContentDocumentIntro>
          <p>
            For å booke baner må du være medlem av <strong>{klubb.navn}</strong>. Alle spillere du
            booker for, må også ha gyldig medlemskap.
          </p>
          {klubb.nettside ? (
            <p>
              Ikke medlem ennå?{" "}
              <a href={klubb.nettside} target="_blank" rel="noopener noreferrer">
                Se medlemskap og priser på klubbens hjemmeside
              </a>
              .
            </p>
          ) : null}
          <p>
            Ved å bekrefte godtar du <Link to="../vilkaar">vilkårene for bruk</Link>.
          </p>
        </ContentDocumentIntro>

        <AdminSettingsForm
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <SettingsSection
            eyebrow="Påkrevd"
            title="Dine opplysninger"
            description="Opplysningene brukes til klubbens medlemsoversikt."
            embedded
          >
            <SettingsPanel>
              <SettingsRow title="Fullt navn" description="Skriv navnet medlemskapet står på.">
                <Field>
                  <Input
                    id="fulltNavn"
                    aria-label="Fullt navn"
                    placeholder="Ola Nordmann"
                    value={fulltNavn}
                    onChange={(event) => setFulltNavn(event.target.value)}
                    disabled={laster || vellykket}
                    autoComplete="name"
                  />
                </Field>
              </SettingsRow>

              <SettingsRow title="Type medlemskap" description="Velg medlemskapet du har betalt.">
                <SettingsRadioGroup
                  label="Type medlemskap"
                  options={MEDLEMSKAP_TYPER}
                  value={medlemskapType}
                  onValueChange={setMedlemskapType}
                  disabled={laster || vellykket}
                />
              </SettingsRow>
            </SettingsPanel>

            <AdminFormActions>
              <ServerFeil feil={feil?.message ?? null} />
              <AdminFormSubmitButton
                isLoading={laster}
                disabled={!kanBekrefte || vellykket}
                loadingText="Bekrefter…"
              >
                {vellykket ? "Bekreftet!" : "Jeg bekrefter medlemskapet"}
              </AdminFormSubmitButton>
            </AdminFormActions>
          </SettingsSection>
        </AdminSettingsForm>
      </ContentDocument>
    </AdminPage>
  );
}
