import PageSection from "@/components/sections/PageSection";
import { FieldGroup, FieldList, FieldRow, InfoRow } from "@/components/fields";
import { FormActions, FormLayout, FormSubmitButton, TextField } from "@/components/forms";

export type Mode = "epost" | "navn";

type Props = {
    epost: string;
    rollerText: string;

    mode: Mode;
    onSetMode: (mode: Mode) => void;

    visningsnavn: string;
    onChangeVisningsnavn: (value: string) => void;

    maxLength: number;

    // validering (samme pattern som klubb)
    canSubmit: boolean;
    isSaving: boolean;
    error: string | null;

    onSubmit: () => void;
};

export default function MinProfilContent({
    epost,
    rollerText,
    mode,
    onSetMode,
    visningsnavn,
    onChangeVisningsnavn,
    maxLength,
    canSubmit,
    isSaving,
    error,
    onSubmit,
}: Props) {
    return (
        <FormLayout
            density="default"
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >
            <PageSection title="Innstillinger" description="Velg hva som vises som navnet ditt i appen.">
                <FieldGroup>
                    <FieldList>
                        <FieldRow title="Visningsnavn" description="Velg e-post eller et eget navn.">
                            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                <input
                                    type="radio"
                                    name="visningsnavn-mode"
                                    checked={mode === "epost"}
                                    onChange={() => onSetMode("epost")}
                                />
                                <span>E-post ({epost})</span>
                            </label>

                            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                <input
                                    type="radio"
                                    name="visningsnavn-mode"
                                    checked={mode === "navn"}
                                    onChange={() => onSetMode("navn")}
                                />
                                <span>Eget navn</span>
                            </label>
                        </FieldRow>

                        {mode === "navn" ? (
                            <FieldRow>
                                <TextField
                                    id="visningsnavn"
                                    label="Eget navn"
                                    hideLabel
                                    value={visningsnavn}
                                    error={error}
                                    onValueChange={onChangeVisningsnavn}
                                    inputProps={{
                                        placeholder: `F.eks. Ola Nordmann (maks ${maxLength} tegn)`,
                                        maxLength,
                                        autoComplete: "name",
                                    }}
                                />
                            </FieldRow>
                        ) : null}
                    </FieldList>
                </FieldGroup>
            </PageSection>

            <PageSection title="Konto" description="Denne informasjonen kan bare endres av klubbadministrator.">
                <FieldGroup>
                    <FieldList>
                        <InfoRow label="Brukernavn / ID" value={epost} />
                        <InfoRow label="Tilgang" value={rollerText} />
                    </FieldList>
                </FieldGroup>
            </PageSection>

            <FormActions>
                <FormSubmitButton isLoading={isSaving} disabled={!canSubmit} fullWidth>
                    Lagre endringer
                </FormSubmitButton>
            </FormActions>
        </FormLayout>
    );
}
