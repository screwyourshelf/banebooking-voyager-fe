import { MapPin } from "lucide-react";
import {
  AdminEditorForm,
  AdminFormActions,
  AdminFormSubmitButton,
  SettingsPanel,
  SettingsRow,
  SettingsSection,
  SettingsStack,
} from "@/components/admin";
import { ServerFeil } from "@/components/errors";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GrenRespons } from "@/types";

type FormState = {
  navn: string;
  beskrivelse: string;
  grenId: string;
};

type Props = {
  form: FormState;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  grener: GrenRespons[];
  canSubmit: boolean;
  isSaving: boolean;
  onSubmit: () => void;
  navnError: string | null;
  onBlurNavn: () => void;
  mutasjonFeil?: string | null;
};

export default function NyBaneContent({
  form,
  onChange,
  grener,
  canSubmit,
  isSaving,
  onSubmit,
  navnError,
  onBlurNavn,
  mutasjonFeil,
}: Props) {
  return (
    <AdminEditorForm
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <SettingsStack embedded>
        <SettingsSection
          embedded
          eyebrow="Bane"
          icon={<MapPin />}
          title="Baneinformasjon"
          description="Det medlemmene skal kjenne igjen i bookingoversikten."
        >
          <SettingsPanel>
            <SettingsRow title="Navn">
              <Field data-invalid={!!navnError}>
                <Input
                  id="ny-navn"
                  aria-label="Navn"
                  placeholder="For eksempel Bane A"
                  disabled={isSaving}
                  value={form.navn}
                  onChange={(event) => onChange("navn", event.target.value)}
                  onBlur={onBlurNavn}
                  aria-invalid={!!navnError}
                  autoComplete="off"
                />
                {navnError ? <FieldError>{navnError}</FieldError> : null}
              </Field>
            </SettingsRow>

            <SettingsRow title="Gren">
              <Field>
                <Select
                  disabled={isSaving}
                  value={form.grenId}
                  onValueChange={(value) => onChange("grenId", value)}
                >
                  <SelectTrigger id="ny-grenId" aria-label="Gren">
                    <SelectValue placeholder="Velg gren…" />
                  </SelectTrigger>
                  <SelectContent>
                    {grener.map((gren) => (
                      <SelectItem key={gren.id} value={gren.id}>
                        {gren.navn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </SettingsRow>

            <SettingsRow title="Beskrivelse">
              <Field>
                <Input
                  id="ny-beskrivelse"
                  aria-label="Beskrivelse"
                  placeholder="For eksempel nær klubbhuset"
                  disabled={isSaving}
                  value={form.beskrivelse}
                  onChange={(event) => onChange("beskrivelse", event.target.value)}
                  autoComplete="off"
                />
              </Field>
            </SettingsRow>
          </SettingsPanel>
        </SettingsSection>

        <AdminFormActions>
          <ServerFeil feil={mutasjonFeil} />
          <AdminFormSubmitButton
            isLoading={isSaving}
            disabled={!canSubmit}
            loadingText="Oppretter…"
          >
            Opprett bane
          </AdminFormSubmitButton>
        </AdminFormActions>
      </SettingsStack>
    </AdminEditorForm>
  );
}
