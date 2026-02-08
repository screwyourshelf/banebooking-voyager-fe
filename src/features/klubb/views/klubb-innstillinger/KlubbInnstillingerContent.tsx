import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row } from "@/components/rows";
import { FormSubmitButton, FormLayout, FormActions } from "@/components/forms";

import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type FormState = {
  navn: string;
  kontaktEpost: string;
  banereglement: string;
  latitude: string;
  longitude: string;
  feedUrl: string;
  feedSynligAntallDager: string;
};

type Props = {
  form: FormState;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;

  canSubmit: boolean;
  isSaving: boolean;
  onSubmit: () => void;

  touched: { navn: boolean; kontaktEpost: boolean };
  errors: { navn: string | null; kontaktEpost: string | null };
  onBlurField: (key: "navn" | "kontaktEpost") => void;
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
}: Props) {
  const navnError = touched.navn ? errors.navn : null;
  const kontaktEpostError = touched.kontaktEpost ? errors.kontaktEpost : null;

  return (
    <FormLayout
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <PageSection title="Grunninfo" description="Informasjon som vises utad i Banebooking.">
        <RowPanel>
          <RowList>
            <Row
              title="Klubbnavn"
              description="Navnet på klubben slik det vises utad i Banebooking."
            >
              <Field data-invalid={!!navnError}>
                <Input
                  id="klubbnavn"
                  value={form.navn}
                  onChange={(e) => onChange("navn", e.target.value)}
                  placeholder="Ås tennisklubb"
                  autoComplete="organization"
                  maxLength={60}
                  onBlur={() => onBlurField("navn")}
                  aria-invalid={!!navnError}
                />
                {navnError ? <FieldError>{navnError}</FieldError> : null}
              </Field>
            </Row>

            <Row
              title="Kontakt-e-post"
              description="Vises på klubbens infoside. Brukes til henvendelser fra medlemmer og gjester."
            >
              <Field data-invalid={!!kontaktEpostError}>
                <Input
                  id="kontaktEpost"
                  value={form.kontaktEpost}
                  onChange={(e) => onChange("kontaktEpost", e.target.value)}
                  placeholder="post@klubb.no"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  onBlur={() => onBlurField("kontaktEpost")}
                  aria-invalid={!!kontaktEpostError}
                />
                {kontaktEpostError ? <FieldError>{kontaktEpostError}</FieldError> : null}
              </Field>
            </Row>
          </RowList>
        </RowPanel>
      </PageSection>

      <PageSection
        title="Kart"
        description="Valgfrie innstillinger for innhenting av værinformasjon."
      >
        <RowPanel>
          <RowList>
            <Row title="Latitude (breddegrad)">
              <Field>
                <Input
                  id="latitude"
                  value={form.latitude}
                  onChange={(e) => onChange("latitude", e.target.value)}
                  placeholder="f.eks. 59.6552"
                  inputMode="decimal"
                />
              </Field>
            </Row>

            <Row title="Longitude (lengdegrad)">
              <Field>
                <Input
                  id="longitude"
                  value={form.longitude}
                  onChange={(e) => onChange("longitude", e.target.value)}
                  placeholder="f.eks. 10.7769"
                  inputMode="decimal"
                />
              </Field>
            </Row>
          </RowList>
        </RowPanel>
      </PageSection>

      <PageSection
        title="Feed"
        description="Valgfrie innstillinger for innhenting av nyheter fra klubbens RSS-feed."
      >
        <RowPanel>
          <RowList>
            <Row
              title="RSS-feed"
              description="URL til klubbens RSS-feed. Hvis satt, hentes og vises de nyeste innleggene i appen."
            >
              <Field>
                <Input
                  id="feedUrl"
                  value={form.feedUrl}
                  onChange={(e) => onChange("feedUrl", e.target.value)}
                  placeholder="https://www.aastk.no/?feed=rss2"
                  inputMode="url"
                  type="url"
                />
              </Field>
            </Row>

            <Row
              title="Aldergrense for feedinnslag (dager)"
              description="Hvor mange dager gamle innslag som vises. Sett til 0 for å inkludere alle."
            >
              <Field>
                <Input
                  id="feedSynligAntallDager"
                  value={form.feedSynligAntallDager}
                  onChange={(e) => onChange("feedSynligAntallDager", e.target.value)}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                />
              </Field>
            </Row>
          </RowList>
        </RowPanel>
      </PageSection>

      <FormActions variant="sticky" align="left" spaced={false} className="w-full">
        <FormSubmitButton
          isLoading={isSaving}
          disabled={!canSubmit}
          loadingText="Lagrer..."
          fullWidth
        >
          Lagre endringer
        </FormSubmitButton>
      </FormActions>
    </FormLayout>
  );
}
