import { Form, Settings } from "@/components";

import { MutationFeedback } from "@/components/feedback";
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
    <Form
      variant="editor"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Settings.Stack embedded>
        <Settings.Section
          embedded
          eyebrow="Gren"
          title="Greninformasjon"
          description="Navn og regler medlemmene møter i bookingflyten."
        >
          <Form.Fields>
            <Form.Field label="Navn" htmlFor="gren-navn" error={navnError}>
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
            </Form.Field>

            <Form.Field
              label="Banereglement"
              description="Valgfritt. Vises før booking."
              htmlFor="gren-banereglement"
            >
              <Textarea
                id="gren-banereglement"
                aria-label="Banereglement"
                placeholder="Skriv reglene medlemmene skal se"
                disabled={isSaving}
                value={form.banereglement}
                onChange={(event) => onChange("banereglement", event.target.value)}
                rows={4}
              />
            </Form.Field>

            <Form.Field
              label="Sortering"
              description="Lavest vises først."
              htmlFor="gren-sortering"
            >
              <Input
                id="gren-sortering"
                aria-label="Sortering"
                type="number"
                disabled={isSaving}
                value={form.sortering}
                onChange={(event) => onChange("sortering", event.target.value)}
                autoComplete="off"
              />
            </Form.Field>

            {showActive ? (
              <Settings.SwitchRow
                title="Aktiv"
                description="Vis grenen i bookingflyten."
                checked={form.aktiv}
                onCheckedChange={(checked) => onChange("aktiv", checked)}
                disabled={isSaving}
              />
            ) : null}
          </Form.Fields>
        </Settings.Section>

        <Settings.Section
          embedded
          eyebrow="Booking"
          title="Bookingregler"
          description="Standardverdier for alle baner i denne grenen."
        >
          <Settings.Panel>
            <Settings.Row
              title="Åpningstid"
              description="Tidligste starttid."
              right={<Settings.Value>{hourLabel(form.aapningstid)}</Settings.Value>}
            >
              <Settings.Range
                aria-label="Åpningstid"
                value={form.aapningstid}
                min={6}
                max={23}
                step={1}
                onChange={(event) => onChange("aapningstid", Number(event.target.value))}
                disabled={isSaving}
              />
            </Settings.Row>

            <Settings.Row
              title="Stengetid"
              description="Seneste starttid."
              right={<Settings.Value>{hourLabel(form.stengetid)}</Settings.Value>}
            >
              <Settings.Range
                aria-label="Stengetid"
                value={form.stengetid}
                min={6}
                max={23}
                step={1}
                onChange={(event) => onChange("stengetid", Number(event.target.value))}
                disabled={isSaving}
              />
            </Settings.Row>

            <Settings.Row
              title="Maks per dag"
              description="Bookinger per medlem."
              right={<Settings.Value>{form.maksPerDag}</Settings.Value>}
            >
              <Settings.Range
                aria-label="Maks bookinger per dag"
                value={form.maksPerDag}
                min={0}
                max={5}
                step={1}
                onChange={(event) => onChange("maksPerDag", Number(event.target.value))}
                disabled={isSaving}
              />
            </Settings.Row>

            <Settings.Row
              title="Maks aktive"
              description="Samtidige bookinger per medlem."
              right={<Settings.Value>{form.maksTotalt}</Settings.Value>}
            >
              <Settings.Range
                aria-label="Maks aktive bookinger"
                value={form.maksTotalt}
                min={0}
                max={10}
                step={1}
                onChange={(event) => onChange("maksTotalt", Number(event.target.value))}
                disabled={isSaving}
              />
            </Settings.Row>

            <Settings.Row
              title="Bookinghorisont"
              description="Dager frem i tid."
              right={<Settings.Value>{form.dagerFremITid} dager</Settings.Value>}
            >
              <Settings.Range
                aria-label="Dager frem i tid"
                value={form.dagerFremITid}
                min={1}
                max={14}
                step={1}
                onChange={(event) => onChange("dagerFremITid", Number(event.target.value))}
                disabled={isSaving}
              />
            </Settings.Row>

            <Settings.Row
              title="Lengde på tider"
              right={<Settings.Value>{slotLabel(form.slotLengdeMinutter)}</Settings.Value>}
            >
              <Settings.Range
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
            </Settings.Row>
          </Settings.Panel>
        </Settings.Section>

        <Form.Actions>
          <MutationFeedback
            error={mutasjonFeil}
            success={lagret}
            successTitle="Greninnstillingene er lagret"
          />
          <Form.Submit isLoading={isSaving} disabled={!canSubmit} loadingText={loadingText}>
            {submitLabel}
          </Form.Submit>
        </Form.Actions>
      </Settings.Stack>
    </Form>
  );
}
