import { useState, useEffect } from "react";
import { useBaner } from "@/hooks/useBaner.js";

import { Button } from "@/components/ui/button.js";
import { FormField } from "@/components/FormField.js";
import { SelectField } from "@/components/SelectField.js";
import SwitchRow from "@/components/SwitchRow";

import SettingsSection from "@/components/SettingsSection";

type BaneFormData = {
    navn: string;
    beskrivelse: string;
    aktiv: boolean;
};

type Props = { slug: string };
const STORAGE_KEY = "rediger.valgtBaneId";

export default function RedigerBaneTab({ slug }: Props) {
    const { baner, isLoading, oppdaterBane } = useBaner(slug, true);

    const [redigerte, setRedigerte] = useState<Record<string, BaneFormData>>({});
    const [valgtBaneId, setValgtBaneId] = useState<string | null>(() => {
        const fraStorage = sessionStorage.getItem(STORAGE_KEY);
        return fraStorage && fraStorage !== "null" ? fraStorage : null;
    });

    const valgtBane = baner.find((b) => b.id === valgtBaneId) ?? null;
    const redigerteVerdier = valgtBaneId ? redigerte[valgtBaneId] ?? null : null;

    useEffect(() => {
        sessionStorage.setItem(STORAGE_KEY, valgtBaneId ?? "null");
    }, [valgtBaneId]);

    useEffect(() => {
        if (valgtBaneId && !baner.some((b) => b.id === valgtBaneId)) {
            setValgtBaneId(null);
        }
    }, [baner, valgtBaneId]);

    useEffect(() => {
        if (!valgtBaneId && baner.length > 0) {
            setValgtBaneId(baner[0].id);
        }
    }, [baner, valgtBaneId]);

    function håndterEndring(
        id: string,
        felt: keyof BaneFormData,
        verdi: string | boolean
    ) {
        setRedigerte((prev) => ({
            ...prev,
            [id]: {
                ...(prev[id] ?? baner.find((b) => b.id === id)!),
                [felt]: verdi,
            },
        }));
    }

    async function lagre() {
        if (!valgtBaneId) return;

        const oppdatert = redigerte[valgtBaneId];
        if (!oppdatert) return;

        try {
            await oppdaterBane.mutateAsync({ id: valgtBaneId, dto: oppdatert });
            setRedigerte((prev) => {
                const ny = { ...prev };
                delete ny[valgtBaneId];
                return ny;
            });
        } catch {
            // Feil håndteres i hook (toast)
        }
    }

    const kanLagre =
        !!valgtBane &&
        !!redigerteVerdier &&
        !(
            redigerteVerdier.navn === valgtBane.navn &&
            redigerteVerdier.beskrivelse === valgtBane.beskrivelse &&
            redigerteVerdier.aktiv === valgtBane.aktiv
        );

    if (isLoading) {
        return (
            <p className="text-sm text-muted-foreground text-center py-4">
                Laster...
            </p>
        );
    }

    return (
        <SettingsSection
            title="Rediger bane"
            description="Velg en bane og oppdater informasjon."
        >
            <form
                className="space-y-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    void lagre();
                }}
            >
                <SelectField
                    id="velg-bane"
                    label="Velg bane"
                    value={valgtBaneId ?? ""}
                    onChange={(val) => setValgtBaneId(val || null)}
                    options={baner.map((b) => ({
                        label: `${b.navn} ${b.aktiv ? "" : "(inaktiv)"}`,
                        value: b.id,
                    }))}
                />

                {valgtBane ? (
                    <>
                        <FormField
                            id="navn"
                            label="Navn"
                            value={redigerteVerdier?.navn ?? valgtBane.navn}
                            onChange={(e) =>
                                håndterEndring(valgtBane.id, "navn", e.target.value)
                            }
                        />

                        <FormField
                            id="beskrivelse"
                            label="Beskrivelse"
                            value={redigerteVerdier?.beskrivelse ?? valgtBane.beskrivelse}
                            onChange={(e) =>
                                håndterEndring(valgtBane.id, "beskrivelse", e.target.value)
                            }
                        />

                        <SwitchRow
                            title="Aktiv"
                            description="Avgjør om banen er tilgjengelig for booking."
                            checked={redigerteVerdier?.aktiv ?? valgtBane.aktiv}
                            onCheckedChange={(checked) => håndterEndring(valgtBane.id, "aktiv", checked)}
                        />

                        <div className="flex justify-end">
                            <Button size="sm" type="submit" disabled={!kanLagre || oppdaterBane.isPending}>
                                {oppdaterBane.isPending ? "Lagrer..." : "Lagre"}
                            </Button>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground italic">
                        Ingen baner funnet.
                    </p>
                )}
            </form>
        </SettingsSection>
    );
}
