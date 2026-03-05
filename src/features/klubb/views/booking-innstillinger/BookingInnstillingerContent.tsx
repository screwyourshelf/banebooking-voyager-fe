import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row } from "@/components/rows";
import { FormSubmitButton, FormLayout, FormActions } from "@/components/forms";
import { Field } from "@/components/ui/field";

type Props = {
  aapningHour: number;
  stengeHour: number;

  booking: {
    maksPerDag: number;
    maksTotalt: number;
    dagerFremITid: number;
    slotLengdeMinutter: number;
  };

  onChangeAapningHour: (val: number) => void;
  onChangeStengeHour: (val: number) => void;
  onChangeMaksPerDag: (val: number) => void;
  onChangeMaksTotalt: (val: number) => void;
  onChangeDagerFremITid: (val: number) => void;
  onChangeSlotLengdeMinutter: (val: string) => void;

  canSubmit: boolean;
  isSaving: boolean;
  onSubmit: () => void;
};

function hourLabel(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

/* slot mapping */
const slotValues = [30, 45, 60, 90];

function slotLabel(min: number) {
  return `${min} min`;
}

export default function BookingInnstillingerContent({
  aapningHour,
  stengeHour,
  booking,
  onChangeAapningHour,
  onChangeStengeHour,
  onChangeMaksPerDag,
  onChangeMaksTotalt,
  onChangeDagerFremITid,
  onChangeSlotLengdeMinutter,
  canSubmit,
  isSaving,
  onSubmit,
}: Props) {
  const slotIndex = Math.max(0, slotValues.indexOf(booking.slotLengdeMinutter));

  return (
    <FormLayout
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <PageSection title="Bookinginnstillinger" description="Styr åpningstider og bookinggrenser.">
        <RowPanel>
          <RowList>
            <Row
              title="Åpningstid"
              description="Tidligste starttidspunkt."
              right={
                <div className="text-sm font-medium tabular-nums">{hourLabel(aapningHour)}</div>
              }
            >
              <Field>
                <input
                  id="aapningstid"
                  type="range"
                  value={aapningHour}
                  min={6}
                  max={23}
                  step={1}
                  onChange={(e) => onChangeAapningHour(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </Field>
            </Row>

            <Row
              title="Stengetid"
              description="Seneste starttidspunkt."
              right={
                <div className="text-sm font-medium tabular-nums">{hourLabel(stengeHour)}</div>
              }
            >
              <Field>
                <input
                  id="stengetid"
                  type="range"
                  value={stengeHour}
                  min={6}
                  max={23}
                  step={1}
                  onChange={(e) => onChangeStengeHour(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </Field>
            </Row>

            <Row
              title="Maks bookinger per dag"
              description="Per bruker."
              right={<div className="text-sm font-medium tabular-nums">{booking.maksPerDag}</div>}
            >
              <Field>
                <input
                  id="maksPerDag"
                  type="range"
                  value={booking.maksPerDag}
                  min={0}
                  max={5}
                  step={1}
                  onChange={(e) => onChangeMaksPerDag(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </Field>
            </Row>

            <Row
              title="Maks aktive bookinger"
              description="Per bruker (totalt)."
              right={<div className="text-sm font-medium tabular-nums">{booking.maksTotalt}</div>}
            >
              <Field>
                <input
                  id="maksTotalt"
                  type="range"
                  value={booking.maksTotalt}
                  min={0}
                  max={10}
                  step={1}
                  onChange={(e) => onChangeMaksTotalt(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </Field>
            </Row>

            <Row
              title="Hvor langt frem du kan booke"
              description="Antall dager frem i tid."
              right={
                <div className="text-sm font-medium tabular-nums">{booking.dagerFremITid}</div>
              }
            >
              <Field>
                <input
                  id="dagerFremITid"
                  type="range"
                  value={booking.dagerFremITid}
                  min={1}
                  max={14}
                  step={1}
                  onChange={(e) => onChangeDagerFremITid(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </Field>
            </Row>

            <Row
              title="Slot-lengde"
              description="Lengde på hver booking."
              right={
                <div className="text-sm font-medium tabular-nums">
                  {slotLabel(booking.slotLengdeMinutter)}
                </div>
              }
            >
              <Field>
                <div className="space-y-2">
                  <input
                    id="slotLengdeMinutter"
                    type="range"
                    min={0}
                    max={slotValues.length - 1}
                    step={1}
                    value={slotIndex}
                    onChange={(e) => {
                      const index = Number(e.target.value);
                      const minutes = slotValues[index];
                      onChangeSlotLengdeMinutter(minutes.toString());
                    }}
                    className="w-full accent-primary"
                  />

                  {/* labels under slider */}
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

      <FormActions variant="sticky">
        <FormSubmitButton
          isLoading={isSaving}
          disabled={!canSubmit}
          fullWidth
          loadingText="Lagrer..."
        >
          Lagre endringer
        </FormSubmitButton>
      </FormActions>
    </FormLayout>
  );
}
