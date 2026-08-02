import type { ReactNode } from "react";

import {
  AdminFormActions,
  AdminFormSubmitButton,
  AdminSettingsForm,
  SettingsPanel,
  SettingsRow,
  SettingsSection,
  SettingsStack,
  SettingsValue,
} from "@/components/admin";
import { Field, FieldError } from "@/components/ui/field";
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
    <SettingsStack>
      <AdminSettingsForm
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <SettingsSection
          eyebrow="Profil"
          title="Slik vises du"
          description="Velg navnet andre ser i Banebooking."
        >
          <SettingsPanel>
            <SettingsRow
              title="Visningsnavn"
              description="Bruk e-postadressen din eller skriv inn et eget navn."
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
            </SettingsRow>

            {mode === "navn" ? (
              <SettingsRow title="Eget navn" description={`Mellom 3 og ${maxLength} tegn.`}>
                <Field data-invalid={!!error}>
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
                  {error ? <FieldError>{error}</FieldError> : null}
                </Field>
              </SettingsRow>
            ) : null}
          </SettingsPanel>

          <AdminFormActions>
            <MutationFeedback
              error={serverFeil}
              success={lagret}
              successTitle="Visningsnavnet er lagret"
            />
            <AdminFormSubmitButton isLoading={isSaving} disabled={!canSubmit} loadingText="Lagrer…">
              Lagre endringer
            </AdminFormSubmitButton>
          </AdminFormActions>
        </SettingsSection>
      </AdminSettingsForm>

      <SettingsSection
        eyebrow="Konto"
        title="Kontoinformasjon"
        description="Tilgang og opplysninger som administreres av klubben."
      >
        <SettingsPanel>
          <SettingsRow title="E-post">
            <SettingsValue>{epost}</SettingsValue>
          </SettingsRow>
          <SettingsRow title="Rolle">
            <SettingsValue>{rollerText}</SettingsValue>
          </SettingsRow>
          {medlemskapBekreftelseLabel ? (
            <SettingsRow title="Medlemskap">
              <RecordStatus tone="available">{medlemskapBekreftelseLabel}</RecordStatus>
            </SettingsRow>
          ) : null}
          {medlemskapBekreftelseLabel && fulltNavn ? (
            <SettingsRow title="Navn i medlemskapet">
              <SettingsValue>{fulltNavn}</SettingsValue>
            </SettingsRow>
          ) : null}
          {medlemskapBekreftelseLabel && medlemskapType ? (
            <SettingsRow title="Medlemskapstype">
              <SettingsValue>{formaterMedlemskapType(medlemskapType)}</SettingsValue>
            </SettingsRow>
          ) : null}
          {medlemskapBekreftelseLabel && medlemskapBekreftetDato ? (
            <SettingsRow title="Bekreftet">
              <SettingsValue>
                {new Date(medlemskapBekreftetDato).toLocaleDateString("nb-NO")}
              </SettingsValue>
            </SettingsRow>
          ) : null}
        </SettingsPanel>
      </SettingsSection>

      <SettingsSection
        eyebrow="Fareområde"
        title="Slett konto"
        description="Sletter kontoen og alle tilknyttede data permanent. Handlingen kan ikke angres."
        tone="danger"
      >
        <AdminFormActions>{deleteAction}</AdminFormActions>
      </SettingsSection>
    </SettingsStack>
  );
}
