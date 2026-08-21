import type { ReactNode } from "react";
import { Form, Settings } from "@/components";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MutationFeedback } from "@/components/feedback";
import { RecordStatus } from "@/components/records";
import { formaterMedlemskapType } from "@/utils/brukerPresentation";

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
  lagret?: boolean;

  onSubmit: () => void;

  // Medlemskapsinformasjon
  medlemskapBekreftelseLabel?: string | null;
  fulltNavn?: string | null;
  medlemskapType?: string | null;
  medlemskapBekreftetDato?: string | null;

  deleteAction: ReactNode;
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
  lagret = false,
  onSubmit,
  medlemskapBekreftelseLabel,
  fulltNavn,
  medlemskapType,
  medlemskapBekreftetDato,
  deleteAction,
}: Props) {
  return (
    <Settings.Stack>
      <Form
        variant="settings"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Settings.Section
          eyebrow="Profil"
          title="Slik vises du"
          description="Velg navnet andre ser i Banebooking."
        >
          <Form.Fields>
            <Form.Field
              label="Visningsnavn"
              description="Bruk e-postadressen din eller skriv inn et eget navn."
              htmlFor="visningsnavn-mode"
            >
              <Select
                value={mode}
                onValueChange={(value) => onSetMode(value === "epost" ? "epost" : "navn")}
                disabled={isSaving}
              >
                <SelectTrigger id="visningsnavn-mode" aria-label="Type visningsnavn">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="epost">Bruk e-postadresse</SelectItem>
                  <SelectItem value="navn">Bruk eget navn</SelectItem>
                </SelectContent>
              </Select>
            </Form.Field>

            {mode === "navn" ? (
              <Form.Field
                label="Eget navn"
                description={`Mellom 3 og ${maxLength} tegn.`}
                htmlFor="visningsnavn"
                error={error}
              >
                <Input
                  id="visningsnavn"
                  aria-label="Eget visningsnavn"
                  value={visningsnavn}
                  onChange={(event) => onChangeVisningsnavn(event.target.value)}
                  placeholder="For eksempel Ola Nordmann"
                  maxLength={maxLength}
                  autoComplete="name"
                  aria-invalid={!!error}
                  disabled={isSaving}
                />
              </Form.Field>
            ) : null}
          </Form.Fields>

          <Form.Actions>
            <MutationFeedback
              error={serverFeil}
              success={lagret}
              successTitle="Visningsnavnet er lagret"
            />
            <Form.Submit isLoading={isSaving} disabled={!canSubmit} loadingText="Lagrer…">
              Lagre endringer
            </Form.Submit>
          </Form.Actions>
        </Settings.Section>
      </Form>

      <Settings.Section
        eyebrow="Konto"
        title="Kontoinformasjon"
        description="Tilgang og opplysninger som administreres av klubben."
      >
        <Settings.Panel>
          <Settings.Row title="E-post">
            <Settings.Value>{epost}</Settings.Value>
          </Settings.Row>
          <Settings.Row title="Rolle">
            <Settings.Value>{rollerText}</Settings.Value>
          </Settings.Row>
          {medlemskapBekreftelseLabel ? (
            <Settings.Row title="Medlemskap">
              <RecordStatus tone="available">{medlemskapBekreftelseLabel}</RecordStatus>
            </Settings.Row>
          ) : null}
          {medlemskapBekreftelseLabel && fulltNavn ? (
            <Settings.Row title="Navn i medlemskapet">
              <Settings.Value>{fulltNavn}</Settings.Value>
            </Settings.Row>
          ) : null}
          {medlemskapBekreftelseLabel && medlemskapType ? (
            <Settings.Row title="Medlemskapstype">
              <Settings.Value>{formaterMedlemskapType(medlemskapType)}</Settings.Value>
            </Settings.Row>
          ) : null}
          {medlemskapBekreftelseLabel && medlemskapBekreftetDato ? (
            <Settings.Row title="Bekreftet">
              <Settings.Value>
                {new Date(medlemskapBekreftetDato).toLocaleDateString("nb-NO")}
              </Settings.Value>
            </Settings.Row>
          ) : null}
        </Settings.Panel>
      </Settings.Section>

      <Settings.Section
        eyebrow="Fareområde"
        title="Slett konto"
        description="Sletter kontoen og alle tilknyttede data permanent. Handlingen kan ikke angres."
        tone="danger"
      >
        <Form.Actions>{deleteAction}</Form.Actions>
      </Settings.Section>
    </Settings.Stack>
  );
}
