import PageSection from "@/components/sections/PageSection";
import { FieldGroup, FieldList, FieldRow } from "@/components/fields";
import { FormSubmitButton, FormLayout, FormActions, TextField } from "@/components/forms";

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
    return (
        <FormLayout
            // Viktig: gi plass til sticky footer (høyde ~48–56px)
            className="pb-20"
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >
            <PageSection title="Grunninfo" description="Informasjon som vises utad i Banebooking.">
                <FieldGroup>
                    <FieldList>
                        <FieldRow
                            title="Klubbnavn"
                            description="Navnet på klubben slik det vises utad i Banebooking."
                        >
                            <TextField
                                id="klubbnavn"
                                label="Klubbnavn"
                                hideLabel
                                value={form.navn}
                                onValueChange={(v) => onChange("navn", v)}
                                error={touched.navn ? errors.navn : null}
                                inputProps={{
                                    placeholder: "Ås tennisklubb",
                                    autoComplete: "organization",
                                    maxLength: 60,
                                    onBlur: () => onBlurField("navn"),
                                }}
                            />
                        </FieldRow>

                        <FieldRow
                            title="Kontakt-e-post"
                            description="Vises på klubbens infoside. Brukes til henvendelser fra medlemmer og gjester."
                        >
                            <TextField
                                id="kontaktEpost"
                                label="Kontakt-e-post"
                                hideLabel
                                value={form.kontaktEpost}
                                onValueChange={(v) => onChange("kontaktEpost", v)}
                                error={touched.kontaktEpost ? errors.kontaktEpost : null}
                                inputProps={{
                                    placeholder: "post@klubb.no",
                                    type: "email",
                                    inputMode: "email",
                                    autoComplete: "email",
                                    onBlur: () => onBlurField("kontaktEpost"),
                                }}
                            />
                        </FieldRow>
                    </FieldList>
                </FieldGroup>
            </PageSection>

            <PageSection title="Kart" description="Valgfrie innstillinger for innhenting av værinformasjon.">
                <FieldGroup>
                    <FieldList>
                        <FieldRow title="Latitude (breddegrad)">
                            <TextField
                                id="latitude"
                                label="Latitude"
                                hideLabel
                                value={form.latitude}
                                onValueChange={(v) => onChange("latitude", v)}
                                inputProps={{
                                    placeholder: "f.eks. 59.6552",
                                    inputMode: "decimal",
                                }}
                            />
                        </FieldRow>

                        <FieldRow title="Longitude (lengdegrad)">
                            <TextField
                                id="longitude"
                                label="Longitude"
                                hideLabel
                                value={form.longitude}
                                onValueChange={(v) => onChange("longitude", v)}
                                inputProps={{
                                    placeholder: "f.eks. 10.7769",
                                    inputMode: "decimal",
                                }}
                            />
                        </FieldRow>
                    </FieldList>
                </FieldGroup>
            </PageSection>

            <PageSection
                title="Feed"
                description="Valgfrie innstillinger for innhenting av nyheter fra klubbens RSS-feed."
            >
                <FieldGroup>
                    <FieldList>
                        <FieldRow
                            title="RSS-feed"
                            description="URL til klubbens RSS-feed. Hvis satt, hentes og vises de nyeste innleggene i appen."
                        >
                            <TextField
                                id="feedUrl"
                                label="RSS-feed"
                                hideLabel
                                value={form.feedUrl}
                                onValueChange={(v) => onChange("feedUrl", v)}
                                inputProps={{
                                    placeholder: "https://www.aastk.no/?feed=rss2",
                                    inputMode: "url",
                                    type: "url",
                                }}
                            />
                        </FieldRow>

                        <FieldRow
                            title="Aldergrense for feedinnslag (dager)"
                            description="Hvor mange dager gamle innslag som vises. Sett til 0 for å inkludere alle."
                        >
                            <TextField
                                id="feedSynligAntallDager"
                                label="Aldergrense for feedinnslag (dager)"
                                hideLabel
                                value={form.feedSynligAntallDager}
                                onValueChange={(v) => onChange("feedSynligAntallDager", v)}
                                inputProps={{
                                    type: "number",
                                    inputMode: "numeric",
                                    min: 0,
                                    step: 1,
                                }}
                            />
                        </FieldRow>
                    </FieldList>
                </FieldGroup>
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
