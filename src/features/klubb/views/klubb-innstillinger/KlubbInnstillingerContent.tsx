import { MapPin, Rss } from "lucide-react";
import {
  AdminFormActions,
  AdminFormSubmitButton,
  AdminSettingsForm,
  SettingsPanel,
  SettingsRow,
  SettingsSection,
  SettingsStack,
} from "@/components/admin";
import { ServerFeil } from "@/components/errors";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export type KlubbFormData = {
  navn: string;
  kontaktEpost: string;
  nettside: string;
  latitude: string;
  longitude: string;
  feedUrl: string;
  feedSynligAntallDager: string;
};

type Props = {
  form: KlubbFormData;
  onChange: <K extends keyof KlubbFormData>(key: K, value: KlubbFormData[K]) => void;
  canSubmit: boolean;
  isSaving: boolean;
  onSubmit: () => void;
  touched: { navn: boolean; kontaktEpost: boolean; feedSynligAntallDager: boolean };
  errors: {
    navn: string | null;
    kontaktEpost: string | null;
    feedSynligAntallDager: string | null;
  };
  onBlurField: (key: "navn" | "kontaktEpost" | "feedSynligAntallDager") => void;
  mutasjonFeil?: string | null;
};

export default function KlubbInnstillingerContent({
  form,
  onChange,
  canSubmit,
  isSaving,
  onSubmit,
  touched,
  errors,
  onBlurField,
  mutasjonFeil,
}: Props) {
  const navnError = touched.navn ? errors.navn : null;
  const kontaktEpostError = touched.kontaktEpost ? errors.kontaktEpost : null;
  const feedSynligAntallDagerError = touched.feedSynligAntallDager
    ? errors.feedSynligAntallDager
    : null;

  return (
    <AdminSettingsForm
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <SettingsStack>
        <SettingsSection
          eyebrow="Profil"
          title="Klubbinformasjon"
          description="Navn og kontaktpunkter medlemmene møter."
        >
          <SettingsPanel>
            <SettingsRow title="Klubbnavn">
              <Field data-invalid={!!navnError}>
                <Input
                  id="klubbnavn"
                  aria-label="Klubbnavn"
                  value={form.navn}
                  onChange={(event) => onChange("navn", event.target.value)}
                  placeholder="Ås tennisklubb"
                  autoComplete="organization"
                  maxLength={60}
                  onBlur={() => onBlurField("navn")}
                  aria-invalid={!!navnError}
                  disabled={isSaving}
                />
                {navnError ? <FieldError>{navnError}</FieldError> : null}
              </Field>
            </SettingsRow>

            <SettingsRow title="Kontakt-e-post" description="Vises i klubbens kontaktinformasjon.">
              <Field data-invalid={!!kontaktEpostError}>
                <Input
                  id="kontaktEpost"
                  aria-label="Kontakt-e-post"
                  value={form.kontaktEpost}
                  onChange={(event) => onChange("kontaktEpost", event.target.value)}
                  placeholder="post@klubb.no"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  onBlur={() => onBlurField("kontaktEpost")}
                  aria-invalid={!!kontaktEpostError}
                  disabled={isSaving}
                />
                {kontaktEpostError ? <FieldError>{kontaktEpostError}</FieldError> : null}
              </Field>
            </SettingsRow>

            <SettingsRow title="Nettside" description="Valgfri lenke til klubbens hjemmeside.">
              <Field>
                <Input
                  id="nettside"
                  aria-label="Nettside"
                  value={form.nettside}
                  onChange={(event) => onChange("nettside", event.target.value)}
                  placeholder="https://www.aastk.no"
                  inputMode="url"
                  type="url"
                  disabled={isSaving}
                />
              </Field>
            </SettingsRow>
          </SettingsPanel>
        </SettingsSection>

        <SettingsSection
          eyebrow="Sted"
          icon={<MapPin />}
          title="Vær og posisjon"
          description="Koordinatene brukes til lokal værinformasjon i bookinglisten."
        >
          <SettingsPanel>
            <SettingsRow title="Breddegrad" description="Desimalgrader mellom −90 og 90.">
              <Field>
                <Input
                  id="latitude"
                  aria-label="Breddegrad"
                  value={form.latitude}
                  onChange={(event) => onChange("latitude", event.target.value)}
                  placeholder="59.6552"
                  inputMode="decimal"
                  disabled={isSaving}
                />
              </Field>
            </SettingsRow>

            <SettingsRow title="Lengdegrad" description="Desimalgrader mellom −180 og 180.">
              <Field>
                <Input
                  id="longitude"
                  aria-label="Lengdegrad"
                  value={form.longitude}
                  onChange={(event) => onChange("longitude", event.target.value)}
                  placeholder="10.7769"
                  inputMode="decimal"
                  disabled={isSaving}
                />
              </Field>
            </SettingsRow>
          </SettingsPanel>
        </SettingsSection>

        <SettingsSection
          eyebrow="Innhold"
          icon={<Rss />}
          title="Nyhetsfeed"
          description="Vis nyheter fra klubbens RSS-feed i Banebooking."
        >
          <SettingsPanel>
            <SettingsRow title="RSS-feed" description="Valgfri adresse til feeden.">
              <Field>
                <Input
                  id="feedUrl"
                  aria-label="RSS-feed"
                  value={form.feedUrl}
                  onChange={(event) => onChange("feedUrl", event.target.value)}
                  placeholder="https://www.aastk.no/?feed=rss2"
                  inputMode="url"
                  type="url"
                  disabled={isSaving}
                />
              </Field>
            </SettingsRow>

            <SettingsRow title="Vis innlegg i" description="Antall dager, fra 1 til 150.">
              <Field data-invalid={!!feedSynligAntallDagerError}>
                <Input
                  id="feedSynligAntallDager"
                  aria-label="Antall dager feedinnlegg vises"
                  value={form.feedSynligAntallDager}
                  onChange={(event) => onChange("feedSynligAntallDager", event.target.value)}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={150}
                  step={1}
                  onBlur={() => onBlurField("feedSynligAntallDager")}
                  aria-invalid={!!feedSynligAntallDagerError}
                  disabled={isSaving}
                />
                {feedSynligAntallDagerError ? (
                  <FieldError>{feedSynligAntallDagerError}</FieldError>
                ) : null}
              </Field>
            </SettingsRow>
          </SettingsPanel>
        </SettingsSection>

        <AdminFormActions embedded={false}>
          <ServerFeil feil={mutasjonFeil} />
          <AdminFormSubmitButton isLoading={isSaving} disabled={!canSubmit} loadingText="Lagrer…">
            Lagre endringer
          </AdminFormSubmitButton>
        </AdminFormActions>
      </SettingsStack>
    </AdminSettingsForm>
  );
}
