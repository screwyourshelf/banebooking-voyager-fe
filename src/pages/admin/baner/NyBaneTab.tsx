import { useState } from "react";
import { useBaner } from "@/hooks/useBaner.js";

import { Button } from "@/components/ui/button.js";
import { FormField } from "@/components/FormField.js";
import SettingsSection from "@/components/SettingsSection";

type BaneFormData = {
    navn: string;
    beskrivelse: string;
};

type Props = { slug: string };

export default function NyBaneTab({ slug }: Props) {
    const { opprettBane } = useBaner(slug);

    const [nyBane, setNyBane] = useState<BaneFormData>({
        navn: "",
        beskrivelse: "",
    });

    const [feilNavn, setFeilNavn] = useState<string | null>(null);

    async function leggTil() {
        const navn = nyBane.navn.trim();

        if (!navn) {
            setFeilNavn("Navn er påkrevd.");
            return;
        }

        setFeilNavn(null);

        try {
            await opprettBane.mutateAsync({ ...nyBane, navn });
            setNyBane({ navn: "", beskrivelse: "" });
        } catch {
            // Backend-feil håndteres i hook (toast), men du kan evt ha fallback her:
            // toast.error("Kunne ikke opprette bane");
        }
    }

    return (
        <SettingsSection title="Ny bane" description="Legg til en ny bane i klubben.">
            <form
                className="space-y-3"
                onSubmit={(e) => {
                    e.preventDefault();
                    void leggTil();
                }}
            >
                <FormField
                    id="ny-navn"
                    label="Navn"
                    value={nyBane.navn}
                    error={feilNavn}
                    onChange={(e) => {
                        const v = e.target.value;
                        setNyBane((f) => ({ ...f, navn: v }));
                        if (feilNavn && v.trim()) setFeilNavn(null);
                    }}
                />

                <FormField
                    id="ny-beskrivelse"
                    label="Beskrivelse"
                    value={nyBane.beskrivelse}
                    onChange={(e) =>
                        setNyBane((f) => ({ ...f, beskrivelse: e.target.value }))
                    }
                />

                <Button size="sm" type="submit" disabled={opprettBane.isPending}>
                    {opprettBane.isPending ? "Legger til..." : "Legg til"}
                </Button>
            </form>
        </SettingsSection>
    );
}
