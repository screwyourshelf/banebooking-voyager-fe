import { useEffect, useMemo, useState } from "react";
import LoaderSkeleton from "@/components/LoaderSkeleton";
import { useMeg } from "@/hooks/useMeg";

import MinProfilContent, { type Mode } from "./MinProfilContent";
import { MAX_VISNINGSNAVN_LENGTH, validateVisningsnavn } from "./visningsnavn";

export default function MinProfilView() {
    const { bruker, laster: lasterMeg, oppdaterVisningsnavn } = useMeg();
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

    const valideringsFeil = useMemo(() => {
        if (!bruker) return "Ukjent feil.";
        if (mode === "epost") return null;
        return validateVisningsnavn(visningsnavn);
    }, [bruker, mode, visningsnavn]);

    const kanLagre = useMemo(() => {
        if (!bruker) return false;

        const ny = valgtVisningsnavn;
        const gammel = (bruker.visningsnavn ?? "").trim();

        if (ny.length === 0) return false;
        if (ny === gammel) return false;

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
        <MinProfilContent
            epost={bruker.epost}
            rollerText={bruker.roller.join(", ")}
            mode={mode}
            onSetMode={(m) => {
                setMode(m);
                setFeil(null);
            }}
            visningsnavn={visningsnavn}
            onChangeVisningsnavn={(value) => {
                setVisningsnavn(value);
                if (feil) setFeil(null);
            }}
            maxLength={MAX_VISNINGSNAVN_LENGTH}
            feil={feil}
            valgtVisningsnavn={valgtVisningsnavn}
            kanLagre={kanLagre}
            isPending={isPending}
            onLagre={() => void lagreVisningsnavn()}
        />
    );
}
