import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button.js";
import LoaderSkeleton from "@/components/LoaderSkeleton.js";
import SettingsList from "@/components/SettingsList";
import SettingsRow from "@/components/SettingsRow";
import InfoRow from "@/components/InfoRow";
import { useMeg } from "@/hooks/useMeg.js";
import SettingsSection from "@/components/SettingsSection";
import { FormField } from "../../components/FormField";

const MAX_LENGTH = 50;
const NAVN_REGEX = /^[\p{L}\d\s.@'_%+-]{2,}$/u;

type Props = { slug: string };
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
        setFeil(null);
    }, [bruker]);

    const valgtVisningsnavn = useMemo(() => {
        if (!bruker) return "";
        return mode === "epost" ? bruker.epost : visningsnavn.trim();
    }, [bruker, mode, visningsnavn]);

    // ✅ ren validering som memo (ingen funksjons-avhengighet)
    const valideringsFeil = useMemo((): string | null => {
        if (!bruker) return "Ukjent feil.";
        if (mode === "epost") return null;

        const navn = visningsnavn.trim();
        if (navn.length === 0) return "Visningsnavn kan ikke være tomt.";
        if (navn.length < 3) return "Visningsnavn må være minst 3 tegn.";
        if (!NAVN_REGEX.test(navn)) return "Visningsnavn inneholder ugyldige tegn.";
        if (navn.length > MAX_LENGTH)
            return `Visningsnavn kan ikke være lengre enn ${MAX_LENGTH} tegn.`;
        return null;
    }, [bruker, mode, visningsnavn]);

    const kanLagre = useMemo(() => {
        if (!bruker) return false;

        const ny = valgtVisningsnavn;
        const gammel = (bruker.visningsnavn ?? "").trim();

        if (ny.length === 0) return false;
        if (ny === gammel) return false;

        // hvis eget navn: må være valid
        if (mode === "navn") return !valideringsFeil;

        return true;
    }, [bruker, valgtVisningsnavn, mode, valideringsFeil]);

    async function lagreVisningsnavn() {
        if (!bruker) return;

        setFeil(valideringsFeil);
        if (valideringsFeil) return;

        await mutateAsync({ visningsnavn: valgtVisningsnavn });
    }

    if (lasterMeg || !bruker) return <LoaderSkeleton />;

    return (
        <div className="space-y-4">
            <SettingsSection
                title="Min profil"
                description="Velg hva som vises som navnet ditt i appen."
            >
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

                    {mode === "navn" ? (
                        <SettingsRow title="Eget navn" description={`Maks ${MAX_LENGTH} tegn.`}>
                            <FormField
                                id="visningsnavn"
                                label="Eget navn"
                                hideLabel
                                value={visningsnavn}
                                error={feil}
                                onChange={(e) => {
                                    setVisningsnavn(e.target.value);
                                    if (feil) setFeil(null);
                                }}
                                inputProps={{
                                    placeholder: "f.eks. Ola Nordmann",
                                    maxLength: MAX_LENGTH,
                                }}
                            />
                        </SettingsRow>
                    ) : null}

                    <SettingsRow
                        title="Dette vil lagres"
                        description="Slik vil navnet ditt vises."
                        right={
                            <Button
                                type="button"
                                size="sm"
                                disabled={!kanLagre || isPending}
                                onClick={() => void lagreVisningsnavn()}
                            >
                                {isPending ? "Lagrer..." : "Lagre"}
                            </Button>
                        }
                    >
                        <div className="text-sm text-foreground break-words">
                            {valgtVisningsnavn}
                        </div>
                    </SettingsRow>
                </SettingsList>
            </SettingsSection>

            <SettingsSection
                title="Konto"
                description="Denne informasjonen kan bare endres av klubbadministrator."
            >
                <SettingsList>
                    <InfoRow label="Brukernavn / ID" value={bruker.epost} />
                    <InfoRow label="Tilgang" value={bruker.roller.join(", ")} />
                </SettingsList>
            </SettingsSection>
        </div>
    );
}
