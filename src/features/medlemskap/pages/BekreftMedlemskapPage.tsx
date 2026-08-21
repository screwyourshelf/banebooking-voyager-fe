import { CircleAlert } from "lucide-react";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Form, Settings, Page, Document } from "@/components";

import { ServerFeil } from "@/components/errors";

import { RecordListState, RecordStatus } from "@/components/records";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBekreftMedlemskap } from "@/hooks/useBekreftMedlemskap";
import { useBruker } from "@/hooks/useBruker";
import { useKlubb } from "@/hooks/useKlubb";
import { MEDLEMSKAP_TYPE_VALG } from "@/utils/brukerPresentation";

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
      <Page
        eyebrow="Medlemskap"
        title="Bekreft medlemskap"
        description="Oppgi medlemskapstype og navnet medlemskapet står på."
      >
        <Page.Loading label="Laster medlemsbekreftelse" />
      </Page>
    );
  }

  if (klubbFeil || brukerFeil || !klubb) {
    return (
      <Page
        eyebrow="Medlemskap"
        title="Bekreft medlemskap"
        description="Oppgi medlemskapstype og navnet medlemskapet står på."
      >
        <Page.State>
          <RecordListState
            icon={<CircleAlert aria-hidden="true" />}
            title="Kunne ikke laste medlemsinformasjonen"
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
        </Page.State>
      </Page>
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
    <Page
      eyebrow="Medlemskap"
      title="Bekreft medlemskap"
      description="Oppgi medlemskapstype og navnet medlemskapet står på."
      actions={
        <RecordStatus tone="warning">
          {bruker?.medlemskapBekreftelseLabel ?? "Må bekreftes"}
        </RecordStatus>
      }
    >
      <Document>
        <Document.Intro>
          <p>
            For å booke baner må du være medlem av <strong>{klubb.navn}</strong>. Alle spillere du
            booker for, må også ha gyldig medlemskap.
          </p>
          {klubb.nettside ? (
            <p>
              Ikke medlem ennå?{" "}
              <a href={klubb.nettside} target="_blank" rel="noopener noreferrer">
                Se medlemskap og priser på klubbens nettside
              </a>
              .
            </p>
          ) : null}
          <p>
            Ved å bekrefte godtar du <Link to="../vilkaar">vilkårene for bruk</Link>.
          </p>
        </Document.Intro>

        <Form
          variant="settings"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <Settings.Section
            eyebrow="Påkrevd"
            title="Dine opplysninger"
            description="Opplysningene brukes til klubbens medlemsoversikt."
            embedded
          >
            <Form.Fields>
              <Form.Field
                label="Fullt navn"
                description="Skriv navnet medlemskapet står på."
                htmlFor="fulltNavn"
              >
                <Input
                  id="fulltNavn"
                  aria-label="Fullt navn"
                  placeholder="Ola Nordmann"
                  value={fulltNavn}
                  onChange={(event) => setFulltNavn(event.target.value)}
                  disabled={laster || vellykket}
                  autoComplete="name"
                />
              </Form.Field>

              <Form.Field label="Medlemskapstype" description="Velg medlemskapet du har betalt.">
                <Settings.RadioGroup
                  label="Medlemskapstype"
                  options={MEDLEMSKAP_TYPE_VALG}
                  value={medlemskapType}
                  onValueChange={setMedlemskapType}
                  disabled={laster || vellykket}
                />
              </Form.Field>
            </Form.Fields>

            <Form.Actions>
              <ServerFeil feil={feil?.message ?? null} />
              <Form.Submit
                isLoading={laster}
                disabled={!kanBekrefte || vellykket}
                loadingText="Bekrefter…"
              >
                {vellykket ? "Bekreftet!" : "Jeg bekrefter medlemskapet"}
              </Form.Submit>
            </Form.Actions>
          </Settings.Section>
        </Form>
      </Document>
    </Page>
  );
}
