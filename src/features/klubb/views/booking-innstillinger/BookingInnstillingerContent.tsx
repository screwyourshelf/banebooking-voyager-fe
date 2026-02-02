import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row } from "@/components/rows";
import { FormSubmitButton, FormLayout, FormActions } from "@/components/forms";

import { Field } from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
            <PageSection title="Bookinginnstillinger" description="Styr åpningstider og bookinggrenser.">
                <RowPanel>
                    <RowList>
                        <Row
                            title="Åpningstid"
                            description="Tidligste starttidspunkt."
                            right={<div className="text-sm font-medium tabular-nums">{hourLabel(aapningHour)}</div>}
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
                            right={<div className="text-sm font-medium tabular-nums">{hourLabel(stengeHour)}</div>}
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
                            right={<div className="text-sm font-medium tabular-nums">{booking.dagerFremITid}</div>}
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

                        <Row title="Slot-lengde" description="Låst i denne versjonen.">
                            <Field>
                                <Select
                                    value={booking.slotLengdeMinutter.toString()}
                                    onValueChange={onChangeSlotLengdeMinutter}
                                    disabled
                                >
                                    <SelectTrigger id="slotLengdeMinutter">
                                        <SelectValue placeholder="Velg slot-lengde" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="30">30 minutter</SelectItem>
                                        <SelectItem value="45">45 minutter</SelectItem>
                                        <SelectItem value="60">60 minutter</SelectItem>
                                        <SelectItem value="90">90 minutter</SelectItem>
                                    </SelectContent>
                                </Select>
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
