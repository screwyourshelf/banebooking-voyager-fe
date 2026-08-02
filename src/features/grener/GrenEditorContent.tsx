import { CalendarClock, Shapes } from "lucide-react";
import {
  AdminEditorForm,
  AdminFormActions,
  AdminFormSubmitButton,
  SettingsPanel,
  SettingsRange,
  SettingsRow,
  SettingsSection,
  SettingsStack,
  SettingsSwitchRow,
  SettingsValue,
} from "@/components/admin";
import { MutationFeedback } from "@/components/feedback";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type GrenFormData = {
  navn: string;
  banereglement: string;
  aktiv: boolean;
  sortering: string;
  aapningstid: number;
  stengetid: number;
  maksPerDag: number;
  maksTotalt: number;
  dagerFremITid: number;
  slotLengdeMinutter: number;
};

type Props = {
  form: GrenFormData;
  onChange: <K extends keyof GrenFormData>(key: K, value: GrenFormData[K]) => void;
  showActive: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  onSubmit: () => void;
  submitLabel: string;
  loadingText: string;
  navnError: string | null;
  onBlurNavn: () => void;
  mutasjonFeil?: string | null;
  lagret?: boolean;
};

const slotValues = [30, 45, 60, 90];

function hourLabel(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function slotLabel(minutes: number) {
  return `${minutes} min`;
}

export default function GrenEditorContent({
  form,
  onChange,
  showActive,
  canSubmit,
  isSaving,
  onSubmit,
  submitLabel,
  loadingText,
  navnError,
  onBlurNavn,
  mutasjonFeil,
  lagret = false,
}: Props) {
  const slotIndex = Math.max(0, slotValues.indexOf(form.slotLengdeMinutter));

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
          eyebrow="Gren"
          icon={<Shapes />}
          title="Greninformasjon"
          description="Navn og regler medlemmene møter i bookingflyten."
        >
          <SettingsPanel>
            <SettingsRow title="Navn">
              <Field data-invalid={!!navnError}>
                <Input
                  id="gren-navn"
                  aria-label="Navn"
                  placeholder="For eksempel Tennis"
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

            <SettingsRow title="Banereglement" description="Valgfritt. Vises før booking.">
              <Field>
                <Textarea
                  id="gren-banereglement"
                  aria-label="Banereglement"
                  placeholder="Skriv reglene medlemmene skal se"
                  disabled={isSaving}
                  value={form.banereglement}
                  onChange={(event) => onChange("banereglement", event.target.value)}
                  rows={4}
                />
              </Field>
            </SettingsRow>

            <SettingsRow title="Sortering" description="Lavest vises først.">
              <Field>
                <Input
                  id="gren-sortering"
                  aria-label="Sortering"
                  type="number"
                  disabled={isSaving}
                  value={form.sortering}
                  onChange={(event) => onChange("sortering", event.target.value)}
                  autoComplete="off"
                />
              </Field>
            </SettingsRow>

            {showActive ? (
              <SettingsSwitchRow
                title="Aktiv"
                description="Vis grenen i bookingflyten."
                checked={form.aktiv}
                onCheckedChange={(checked) => onChange("aktiv", checked)}
                disabled={isSaving}
              />
            ) : null}
          </SettingsPanel>
        </SettingsSection>

        <SettingsSection
          embedded
          eyebrow="Booking"
          icon={<CalendarClock />}
          title="Bookingregler"
          description="Standardverdier for alle baner i denne grenen."
        >
          <SettingsPanel>
            <SettingsRow
              title="Åpningstid"
              description="Tidligste starttid."
              right={<SettingsValue>{hourLabel(form.aapningstid)}</SettingsValue>}
            >
              <SettingsRange
                aria-label="Åpningstid"
                value={form.aapningstid}
                min={6}
                max={23}
                step={1}
                onChange={(event) => onChange("aapningstid", Number(event.target.value))}
                disabled={isSaving}
              />
            </SettingsRow>

            <SettingsRow
              title="Stengetid"
              description="Seneste starttid."
              right={<SettingsValue>{hourLabel(form.stengetid)}</SettingsValue>}
            >
              <SettingsRange
                aria-label="Stengetid"
                value={form.stengetid}
                min={6}
                max={23}
                step={1}
                onChange={(event) => onChange("stengetid", Number(event.target.value))}
                disabled={isSaving}
              />
            </SettingsRow>

            <SettingsRow
              title="Maks per dag"
              description="Bookinger per medlem."
              right={<SettingsValue>{form.maksPerDag}</SettingsValue>}
            >
              <SettingsRange
                aria-label="Maks bookinger per dag"
                value={form.maksPerDag}
                min={0}
                max={5}
                step={1}
                onChange={(event) => onChange("maksPerDag", Number(event.target.value))}
                disabled={isSaving}
              />
            </SettingsRow>

            <SettingsRow
              title="Maks aktive"
              description="Samtidige bookinger per medlem."
              right={<SettingsValue>{form.maksTotalt}</SettingsValue>}
            >
              <SettingsRange
                aria-label="Maks aktive bookinger"
                value={form.maksTotalt}
                min={0}
                max={10}
                step={1}
                onChange={(event) => onChange("maksTotalt", Number(event.target.value))}
                disabled={isSaving}
              />
            </SettingsRow>

            <SettingsRow
              title="Bookinghorisont"
              description="Dager frem i tid."
              right={<SettingsValue>{form.dagerFremITid} dager</SettingsValue>}
            >
              <SettingsRange
                aria-label="Dager frem i tid"
                value={form.dagerFremITid}
                min={1}
                max={14}
                step={1}
                onChange={(event) => onChange("dagerFremITid", Number(event.target.value))}
                disabled={isSaving}
              />
            </SettingsRow>

            <SettingsRow
              title="Lengde på tider"
              right={<SettingsValue>{slotLabel(form.slotLengdeMinutter)}</SettingsValue>}
            >
              <SettingsRange
                aria-label="Lengde på tider"
                min={0}
                max={slotValues.length - 1}
                step={1}
                value={slotIndex}
                onChange={(event) => {
                  const minutes = slotValues[Number(event.target.value)];
                  onChange("slotLengdeMinutter", minutes);
                }}
                disabled={isSaving}
                labels={
                  <>
                    {slotValues.map((value) => (
                      <span key={value}>{value}</span>
                    ))}
                  </>
                }
              />
            </SettingsRow>
          </SettingsPanel>
        </SettingsSection>

        <AdminFormActions>
          <MutationFeedback
            error={mutasjonFeil}
            success={lagret}
            successTitle="Greninnstillingene er lagret"
          />
          <AdminFormSubmitButton
            isLoading={isSaving}
            disabled={!canSubmit}
            loadingText={loadingText}
          >
            {submitLabel}
          </AdminFormSubmitButton>
        </AdminFormActions>
      </SettingsStack>
    </AdminEditorForm>
  );
}
