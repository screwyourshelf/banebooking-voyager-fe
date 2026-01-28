import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button.js";
import LoaderSkeleton from "@/components/LoaderSkeleton.js";
import SettingsList from "@/components/SettingsList";
import SettingsRow from "@/components/SettingsRow";
import { FieldWrapper } from "@/components/FieldWrapper.js";
import { Input } from "@/components/ui/input.js";
import { useMeg } from "@/hooks/useMeg.js";
import SettingsSection from "../../components/SettingsSection";

const MAX_LENGTH = 50;
const NAVN_REGEX = /^[\p{L}\d\s.@'_%+-]{2,}$/u;

type Props = {
    slug: string;
};

type Mode = "epost" | "navn";

export default function MinProfilTab({ slug }: Props) {
    const { bruker, laster: lasterMeg, oppdaterVisningsnavn } = useMeg(slug);
    const { mutateAsync, isPending } = oppdaterVisningsnavn;

    const [mode, setMode] = useState<Mode>("epost");
    const [visningsnavn, setVisningsnavn] = useState("");
    const [feil, setFeil] = useState<string | null>(null);

    useEffect(() => {
        if (!bruker) return;

        const navn = bruker.visningsnavn?.trim();
        if (!navn || navn === bruker.epost) {
            setMode("epost");
            setVisningsnavn("");
        } else {
            setMode("navn");
            setVisningsnavn(navn);
        }
    }, [bruker]);

    const kanLagre = useMemo(() => {
        if (!bruker) return false;
        if (mode === "epost") return bruker.visningsnavn !== bruker.epost;
        return visningsnavn.trim() !== (bruker.visningsnavn ?? "").trim();
    }, [bruker, mode, visningsnavn]);

    const validerOgLagre = async () => {
        if (!bruker) return;

        if (mode === "epost") {
            setFeil(null);
            await mutateAsync({ visningsnavn: bruker.epost });
            return;
        }

        const navn = visningsnavn.trim();

        if (navn.length === 0) return setFeil("Visningsnavn kan ikke være tomt.");
        if (navn.length < 3) return setFeil("Visningsnavn må være minst 3 tegn.");
        if (!NAVN_REGEX.test(navn)) return setFeil("Visningsnavn inneholder ugyldige tegn.");
        if (navn.length > MAX_LENGTH)
            return setFeil(`Visningsnavn kan ikke være lengre enn ${MAX_LENGTH} tegn.`);

        setFeil(null);
        await mutateAsync({ visningsnavn: navn });
    };

    if (lasterMeg || !bruker) {
        return <LoaderSkeleton />;
    }

    return (
        <div className="space-y-4">
            <SettingsSection
                title="Min profil"
                description="Velg hva som vises som navnet ditt i appen."
            >

                {/* Visningsnavn */}
                <SettingsList>
                    <SettingsRow
                        title="Visningsnavn"
                        description="Velg e-post eller et eget navn."
                    >
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                <input
                                    type="radio"
                                    name="visningsnavn-mode"
                                    checked={mode === "epost"}
                                    onChange={() => {
                                        setMode("epost");
                                        setFeil(null);
                                        setVisningsnavn("");
                                    }}
                                />
                                <span>E-post ({bruker.epost})</span>
                            </label>

                            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                <input
                                    type="radio"
                                    name="visningsnavn-mode"
                                    checked={mode === "navn"}
                                    onChange={() => {
                                        setMode("navn");
                                        setFeil(null);
                                    }}
                                />
                                <span>Eget navn</span>
                            </label>
                        </div>
                    </SettingsRow>

                    <SettingsRow
                        title="Eget navn"
                        description={`Maks ${MAX_LENGTH} tegn.`}
                        right={
                            <Button
                                type="button"
                                size="sm"
                                disabled={!kanLagre || isPending}
                                onClick={() => void validerOgLagre()}
                            >
                                {isPending ? "Lagrer..." : "Lagre"}
                            </Button>
                        }
                        className={mode === "navn" ? "" : "opacity-50"}
                    >
                        <FieldWrapper id="visningsnavn" label="" error={feil} className="space-y-0">
                            <Input
                                id="visningsnavn"
                                value={mode === "navn" ? visningsnavn : ""}
                                maxLength={MAX_LENGTH}
                                placeholder="f.eks. Ola Nordmann"
                                onChange={(e) => setVisningsnavn(e.target.value)}
                                disabled={mode !== "navn"}
                                className={feil ? "border-destructive" : ""}
                            />
                        </FieldWrapper>
                    </SettingsRow>
                </SettingsList>
            </SettingsSection>

            {/* Konto */}
            <SettingsSection
                title="Konto"
                description="Denne informasjonen kan bare endres av klubbadministrator."
            >

                <SettingsList>
                    <SettingsRow title="Brukernavn / ID">
                        <div className="text-sm text-foreground">{bruker.epost}</div>
                    </SettingsRow>

                    <SettingsRow title="Rolle (i klubben)">
                        <div className="text-sm text-foreground">{bruker.roller.join(", ")}</div>
                    </SettingsRow>
                </SettingsList>
            </SettingsSection>

        </div>
    );
}
