import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row } from "@/components/rows";
import { FormActions, FormLayout, FormSubmitButton } from "@/components/forms";

import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type FormState = {
  navn: string;
  beskrivelse: string;
};

type Props = {
  form: FormState;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;

  canSubmit: boolean;
  isSaving: boolean;
  onSubmit: () => void;

  navnError: string | null;
  onBlurNavn: () => void;
};

export default function NyBaneContent({
  form,
  onChange,
  canSubmit,
  isSaving,
  onSubmit,
  navnError,
  onBlurNavn,
}: Props) {
  return (
    <FormLayout
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <PageSection title="Ny bane" description="Legg til en ny bane i klubben.">
        <RowPanel>
          <RowList>
            <Row title="Navn" description="Navn på banen slik det vises i booking.">
              <Field data-invalid={!!navnError}>
                <Input
                  id="ny-navn"
                  disabled={isSaving}
                  value={form.navn}
                  onChange={(e) => onChange("navn", e.target.value)}
                  onBlur={onBlurNavn}
                  aria-invalid={!!navnError}
                  autoComplete="off"
                />
                {navnError ? <FieldError>{navnError}</FieldError> : null}
              </Field>
            </Row>

            <Row title="Beskrivelse" description="Valgfritt.">
              <Field>
                <Input
                  id="ny-beskrivelse"
                  disabled={isSaving}
                  value={form.beskrivelse}
                  onChange={(e) => onChange("beskrivelse", e.target.value)}
                  autoComplete="off"
                />
              </Field>
            </Row>
          </RowList>
        </RowPanel>
      </PageSection>

      <FormActions variant="sticky" align="left" spaced={false} className="w-full">
        <FormSubmitButton
          fullWidth
          isLoading={isSaving}
          disabled={!canSubmit}
          loadingText="Legger til..."
        >
          Legg til
        </FormSubmitButton>
      </FormActions>
    </FormLayout>
  );
}
