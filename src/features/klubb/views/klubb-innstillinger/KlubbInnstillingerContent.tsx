import { Form, Settings } from "@/components";

import { MutationFeedback } from "@/components/feedback";
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
  lagret?: boolean;
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
  lagret = false,
}: Props) {
  const navnError = touched.navn ? errors.navn : null;
  const kontaktEpostError = touched.kontaktEpost ? errors.kontaktEpost : null;
  const feedSynligAntallDagerError = touched.feedSynligAntallDager
    ? errors.feedSynligAntallDager
    : null;

  return (
    <Form
      variant="settings"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Settings.Stack>
        <Settings.Section
          eyebrow="Profil"
          title="Klubbinformasjon"
          description="Navn og kontaktpunkter medlemmene møter."
        >
          <Form.Fields>
            <Form.Field label="Klubbnavn" htmlFor="klubbnavn" error={navnError}>
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
            </Form.Field>

            <Form.Field
              label="Kontakt-e-post"
              description="Vises i klubbens kontaktinformasjon."
              htmlFor="kontaktEpost"
              error={kontaktEpostError}
            >
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
            </Form.Field>

            <Form.Field
              label="Nettside"
              description="Valgfri lenke til klubbens nettside."
              htmlFor="nettside"
            >
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
            </Form.Field>
          </Form.Fields>
        </Settings.Section>

        <Settings.Section
          eyebrow="Sted"
          title="Vær og posisjon"
          description="Koordinatene brukes til lokal værinformasjon i Book bane."
        >
          <Form.Fields>
            <Form.Field
              label="Breddegrad"
              description="Desimalgrader mellom −90 og 90."
              htmlFor="latitude"
            >
              <Input
                id="latitude"
                aria-label="Breddegrad"
                value={form.latitude}
                onChange={(event) => onChange("latitude", event.target.value)}
                placeholder="59.6552"
                inputMode="decimal"
                disabled={isSaving}
              />
            </Form.Field>

            <Form.Field
              label="Lengdegrad"
              description="Desimalgrader mellom −180 og 180."
              htmlFor="longitude"
            >
              <Input
                id="longitude"
                aria-label="Lengdegrad"
                value={form.longitude}
                onChange={(event) => onChange("longitude", event.target.value)}
                placeholder="10.7769"
                inputMode="decimal"
                disabled={isSaving}
              />
            </Form.Field>
          </Form.Fields>
        </Settings.Section>

        <Settings.Section
          eyebrow="Innhold"
          title="Nyhetsfeed"
          description="Vis nyheter fra klubbens RSS-feed i Banebooking."
        >
          <Form.Fields>
            <Form.Field
              label="RSS-feed"
              description="Valgfri adresse til feeden."
              htmlFor="feedUrl"
            >
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
            </Form.Field>

            <Form.Field
              label="Vis innlegg i"
              description="Antall dager, fra 1 til 150."
              htmlFor="feedSynligAntallDager"
              error={feedSynligAntallDagerError}
            >
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
            </Form.Field>
          </Form.Fields>
        </Settings.Section>

        <Form.Actions embedded={false}>
          <MutationFeedback
            error={mutasjonFeil}
            success={lagret}
            successTitle="Klubbinnstillingene er lagret"
          />
          <Form.Submit isLoading={isSaving} disabled={!canSubmit} loadingText="Lagrer…">
            Lagre endringer
          </Form.Submit>
        </Form.Actions>
      </Settings.Stack>
    </Form>
  );
}
