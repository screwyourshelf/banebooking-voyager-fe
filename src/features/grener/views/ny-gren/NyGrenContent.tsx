import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row } from "@/components/rows";
import { FormActions, FormLayout, FormSubmitButton } from "@/components/forms";

import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ServerFeil } from "@/components/errors";

type FormState = {
  navn: string;
  banereglement: string;
  sortering: string;
  aapningstid: number;
  stengetid: number;
  maksPerDag: number;
  maksTotalt: number;
  dagerFremITid: number;
  slotLengdeMinutter: number;
};

type Props = {
  form: FormState;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;

  canSubmit: boolean;
  isSaving: boolean;
  onSubmit: () => void;

  navnError: string | null;
  onBlurNavn: () => void;
  mutasjonFeil?: string | null;
};

function hourLabel(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

const slotValues = [30, 45, 60, 90];

function slotLabel(min: number) {
  return `${min} min`;
}

export default function NyGrenContent({
  form,
  onChange,
  canSubmit,
  isSaving,
  onSubmit,
  navnError,
  onBlurNavn,
  mutasjonFeil,
}: Props) {
  const slotIndex = Math.max(0, slotValues.indexOf(form.slotLengdeMinutter));

  return (
    <FormLayout
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <PageSection title="Ny gren">
        <RowPanel>
          <RowList>
            <Row title="Navn" description="F.eks. Tennis, Padel.">
              <Field data-invalid={!!navnError}>
                <Input
                  id="ny-gren-navn"
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

            <Row title="Banereglement" description="Valgfritt. Vises i bookingvisningen.">
              <Field>
                <Textarea
                  id="ny-gren-banereglement"
                  disabled={isSaving}
                  value={form.banereglement}
                  onChange={(e) => onChange("banereglement", e.target.value)}
                  rows={4}
                />
              </Field>
            </Row>

            <Row title="Sortering" description="Lave tall vises først. Standard: 0.">
              <Field>
                <Input
                  id="ny-gren-sortering"
                  type="number"
                  disabled={isSaving}
                  value={form.sortering}
                  onChange={(e) => onChange("sortering", e.target.value)}
                  autoComplete="off"
                />
              </Field>
            </Row>
          </RowList>
        </RowPanel>
      </PageSection>

      <PageSection title="Bookinginnstillinger" description="Styr åpningstider og bookinggrenser.">
        <RowPanel>
          <RowList>
            <Row
              title="Åpningstid"
              description="Tidligste starttidspunkt."
              right={
                <div className="text-sm font-medium tabular-nums">
                  {hourLabel(form.aapningstid)}
                </div>
              }
            >
              <Field>
                <input
                  type="range"
                  value={form.aapningstid}
                  min={6}
                  max={23}
                  step={1}
                  onChange={(e) => onChange("aapningstid", Number(e.target.value))}
                  className="w-full accent-primary"
                  disabled={isSaving}
                />
              </Field>
            </Row>

            <Row
              title="Stengetid"
              description="Seneste starttidspunkt."
              right={
                <div className="text-sm font-medium tabular-nums">{hourLabel(form.stengetid)}</div>
              }
            >
              <Field>
                <input
                  type="range"
                  value={form.stengetid}
                  min={6}
                  max={23}
                  step={1}
                  onChange={(e) => onChange("stengetid", Number(e.target.value))}
                  className="w-full accent-primary"
                  disabled={isSaving}
                />
              </Field>
            </Row>

            <Row
              title="Maks bookinger per dag"
              description="Per bruker."
              right={<div className="text-sm font-medium tabular-nums">{form.maksPerDag}</div>}
            >
              <Field>
                <input
                  type="range"
                  value={form.maksPerDag}
                  min={0}
                  max={5}
                  step={1}
                  onChange={(e) => onChange("maksPerDag", Number(e.target.value))}
                  className="w-full accent-primary"
                  disabled={isSaving}
                />
              </Field>
            </Row>

            <Row
              title="Maks aktive bookinger"
              description="Per bruker (totalt)."
              right={<div className="text-sm font-medium tabular-nums">{form.maksTotalt}</div>}
            >
              <Field>
                <input
                  type="range"
                  value={form.maksTotalt}
                  min={0}
                  max={10}
                  step={1}
                  onChange={(e) => onChange("maksTotalt", Number(e.target.value))}
                  className="w-full accent-primary"
                  disabled={isSaving}
                />
              </Field>
            </Row>

            <Row
              title="Hvor langt frem du kan booke"
              description="Antall dager frem i tid."
              right={<div className="text-sm font-medium tabular-nums">{form.dagerFremITid}</div>}
            >
              <Field>
                <input
                  type="range"
                  value={form.dagerFremITid}
                  min={1}
                  max={14}
                  step={1}
                  onChange={(e) => onChange("dagerFremITid", Number(e.target.value))}
                  className="w-full accent-primary"
                  disabled={isSaving}
                />
              </Field>
            </Row>

            <Row
              title="Slot-lengde"
              description="Lengde på hver booking."
              right={
                <div className="text-sm font-medium tabular-nums">
                  {slotLabel(form.slotLengdeMinutter)}
                </div>
              }
            >
              <Field>
                <div className="space-y-2">
                  <input
                    type="range"
                    min={0}
                    max={slotValues.length - 1}
                    step={1}
                    value={slotIndex}
                    onChange={(e) => {
                      const index = Number(e.target.value);
                      const minutes = slotValues[index];
                      onChange("slotLengdeMinutter", minutes);
                    }}
                    className="w-full accent-primary"
                    disabled={isSaving}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground px-1">
                    {slotValues.map((v) => (
                      <span key={v}>{v}</span>
                    ))}
                  </div>
                </div>
              </Field>
            </Row>
          </RowList>
        </RowPanel>
      </PageSection>

      <FormActions variant="sticky" align="left" spaced={false} className="w-full">
        <ServerFeil feil={mutasjonFeil} />
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
