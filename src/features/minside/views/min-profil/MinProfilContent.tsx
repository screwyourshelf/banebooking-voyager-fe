import type { ReactNode } from "react";

import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row, InfoRow } from "@/components/rows";
import { FormActions, FormLayout, FormSubmitButton } from "@/components/forms";

import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ServerFeil } from "@/components/errors";

export type Mode = "epost" | "navn";

type Props = {
  epost: string;
  rollerText: string;

  mode: Mode;
  onSetMode: (mode: Mode) => void;

  visningsnavn: string;
  onChangeVisningsnavn: (value: string) => void;

  maxLength: number;

  canSubmit: boolean;
  isSaving: boolean;
  error: string | null;
  serverFeil?: string | null;

  onSubmit: () => void;

  // Medlemskapsinformasjon
  medlemskapBekreftelseLabel?: string | null;
  fulltNavn?: string | null;
  medlemskapType?: string | null;
  medlemskapBekreftetDato?: string | null;

  // NYTT: ferdig knapp (dialog-trigger) sendes inn fra view
  deleteAction: ReactNode;
  isDeleteDisabled?: boolean;
};

const MEDLEMSKAP_TYPE_LABELS: Record<string, string> = {
  BarnJunior: "Barn/junior (inntil 19 år)",
  StudentVernepliktig: "Student/vernepliktig",
  Voksen: "Voksen",
  Familie: "Familiemedlemskap",
};

export default function MinProfilContent({
  epost,
  rollerText,
  mode,
  onSetMode,
  visningsnavn,
  onChangeVisningsnavn,
  maxLength,
  canSubmit,
  isSaving,
  error,
  serverFeil,
  onSubmit,
  medlemskapBekreftelseLabel,
  fulltNavn,
  medlemskapType,
  medlemskapBekreftetDato,
  deleteAction,
  isDeleteDisabled = false,
}: Props) {
  return (
    <FormLayout
      density="default"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <PageSection title="Innstillinger" description="Velg hva som vises som navnet ditt i appen.">
        <RowPanel>
          <RowList>
            <Row title="Visningsnavn">
              <RadioGroup
                value={mode}
                onValueChange={(v) => onSetMode(v === "epost" ? "epost" : "navn")}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="epost" id="visningsnavn-epost" />
                  <Label htmlFor="visningsnavn-epost">E-post ({epost})</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="navn" id="visningsnavn-navn" />
                  <Label htmlFor="visningsnavn-navn">Eget navn</Label>
                </div>
              </RadioGroup>
            </Row>

            {mode === "navn" ? (
              <Row>
                <Field data-invalid={!!error}>
                  <Input
                    id="visningsnavn"
                    value={visningsnavn}
                    onChange={(e) => onChangeVisningsnavn(e.target.value)}
                    placeholder={`F.eks. Ola Nordmann (maks ${maxLength} tegn)`}
                    maxLength={maxLength}
                    autoComplete="name"
                    aria-invalid={!!error}
                  />
                  {error ? <FieldError>{error}</FieldError> : null}
                </Field>
              </Row>
            ) : null}
          </RowList>
        </RowPanel>
      </PageSection>

      <PageSection
        title="Konto"
        description="Kontoinformasjon og tilgang. Enkelte opplysninger administreres av klubben."
      >
        <RowPanel>
          <RowList>
            <InfoRow label="Brukernavn / ID" value={epost} />
            <InfoRow label="Tilgang" value={rollerText} />
            {medlemskapBekreftelseLabel && fulltNavn ? <InfoRow label="Navn (medlemskap)" value={fulltNavn} /> : null}
            {medlemskapBekreftelseLabel && medlemskapType ? (
              <InfoRow
                label="Type medlemskap"
                value={MEDLEMSKAP_TYPE_LABELS[medlemskapType] ?? medlemskapType}
              />
            ) : null}
            {medlemskapBekreftelseLabel && medlemskapBekreftetDato ? (
              <InfoRow
                label="Medlemskap bekreftet"
                value={new Date(medlemskapBekreftetDato).toLocaleDateString("nb-NO")}
              />
            ) : null}

            {/* Destruktiv handling som egen rad i Konto */}
            <Row
              title="Slett min bruker"
              description="Sletter bruker og all tilknyttet data permanent."
              right={
                <div className={isDeleteDisabled ? "pointer-events-none opacity-60" : ""}>
                  {deleteAction}
                </div>
              }
            />
          </RowList>
        </RowPanel>
      </PageSection>

      <FormActions variant="sticky" align="left" spaced={false} className="w-full">
        <ServerFeil feil={serverFeil} />
        <FormSubmitButton
          isLoading={isSaving}
          disabled={!canSubmit}
          fullWidth
          loadingText="Lagrer..."
        >
          Lagre endringer
        </FormSubmitButton>
      </FormActions>
    </FormLayout>
  );
}
