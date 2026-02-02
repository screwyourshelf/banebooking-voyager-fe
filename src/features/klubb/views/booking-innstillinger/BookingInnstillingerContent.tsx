import PageSection from "@/components/sections/PageSection";
import { FieldGroup, FieldList, FieldRow } from "@/components/fields";
import { FormSubmitButton, FormLayout, FormActions, RangeField, SelectField } from "@/components/forms";

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
    return (
        <FormLayout
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >
            <PageSection
                title="Bookinginnstillinger"
                description="Styr åpningstider og bookinggrenser."
            >
                <FieldGroup>
                    <FieldList>
                        <FieldRow
                            title="Åpningstid"
                            description="Tidligste starttidspunkt."
                            right={
                                <div className="text-sm font-medium tabular-nums">
                                    {hourLabel(aapningHour)}
                                </div>
                            }
                        >
                            <RangeField
                                id="aapningstid"
                                label="Åpningstid"
                                hideLabel
                                value={aapningHour}
                                min={6}
                                max={23}
                                step={1}
                                onValueChange={onChangeAapningHour}
                            />
                        </FieldRow>

                        <FieldRow
                            title="Stengetid"
                            description="Seneste starttidspunkt."
                            right={
                                <div className="text-sm font-medium tabular-nums">
                                    {hourLabel(stengeHour)}
                                </div>
                            }
                        >
                            <RangeField
                                id="stengetid"
                                label="Stengetid"
                                hideLabel
                                value={stengeHour}
                                min={6}
                                max={23}
                                step={1}
                                onValueChange={onChangeStengeHour}
                            />
                        </FieldRow>

                        <FieldRow
                            title="Maks bookinger per dag"
                            description="Per bruker."
                            right={
                                <div className="text-sm font-medium tabular-nums">
                                    {booking.maksPerDag}
                                </div>
                            }
                        >
                            <RangeField
                                id="maksPerDag"
                                label="Maks bookinger per dag"
                                hideLabel
                                value={booking.maksPerDag}
                                min={0}
                                max={5}
                                step={1}
                                onValueChange={onChangeMaksPerDag}
                            />
                        </FieldRow>

                        <FieldRow
                            title="Maks aktive bookinger"
                            description="Per bruker (totalt)."
                            right={
                                <div className="text-sm font-medium tabular-nums">
                                    {booking.maksTotalt}
                                </div>
                            }
                        >
                            <RangeField
                                id="maksTotalt"
                                label="Maks aktive bookinger"
                                hideLabel
                                value={booking.maksTotalt}
                                min={0}
                                max={10}
                                step={1}
                                onValueChange={onChangeMaksTotalt}
                            />
                        </FieldRow>

                        <FieldRow
                            title="Hvor langt frem du kan booke"
                            description="Antall dager frem i tid."
                            right={
                                <div className="text-sm font-medium tabular-nums">
                                    {booking.dagerFremITid}
                                </div>
                            }
                        >
                            <RangeField
                                id="dagerFremITid"
                                label="Hvor langt frem du kan booke"
                                hideLabel
                                value={booking.dagerFremITid}
                                min={1}
                                max={14}
                                step={1}
                                onValueChange={onChangeDagerFremITid}
                            />
                        </FieldRow>

                        <FieldRow
                            title="Slot-lengde"
                            description="Låst i denne versjonen."
                        >
                            <SelectField
                                id="slotLengdeMinutter"
                                label="Slot-lengde"
                                hideLabel
                                value={booking.slotLengdeMinutter.toString()}
                                onChange={onChangeSlotLengdeMinutter}
                                options={[
                                    { label: "30 minutter", value: "30" },
                                    { label: "45 minutter", value: "45" },
                                    { label: "60 minutter", value: "60" },
                                    { label: "90 minutter", value: "90" },
                                ]}
                                disabled
                            />
                        </FieldRow>
                    </FieldList>
                </FieldGroup>
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
