import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import LoaderSkeleton from "@/components/LoaderSkeleton";
import { useArrangement } from "@/hooks/useArrangement";

import ArrangementContent from "./ArrangementContent";
import { byggDto, finnTilgjengeligeUkedager } from "./arrangementUtils";

const KATEGORIER = [
    "Trening",
    "Turnering",
    "Klubbmersterskap",
    "Kurs",
    "Lagkamp",
    "Stigespill",
    "Dugnad",
    "Vedlikehold",
    "Sosialt",
    "Annet",
] as const;

export default function ArrangementView() {
    const {
        baner,
        tilgjengeligeTidspunkter,
        forhandsvisning,
        forhandsvis,
        clearForhandsvisning,
        opprett,
        isLoading,
        isLoadingForhandsvisning,
    } = useArrangement();

    // DatoVelger.onChange tar Date (ikke null), så vi gjør disse non-null her.
    const [datoFra, setDatoFra] = useState<Date>(new Date());
    const [datoTil, setDatoTil] = useState<Date>(new Date());

    const [valgteBaner, setValgteBaner] = useState<string[]>([]);
    const [valgteUkedager, setValgteUkedager] = useState<string[]>([]);
    const [valgteTidspunkter, setValgteTidspunkter] = useState<string[]>([]);

    const [alleBaner, setAlleBaner] = useState(false);
    const [alleUkedager, setAlleUkedager] = useState(false);
    const [alleTidspunkter, setAlleTidspunkter] = useState(false);

    const [kategori, setKategori] = useState<(typeof KATEGORIER)[number]>("Annet");
    const [beskrivelse, setBeskrivelse] = useState("");

    const [dialogOpen, setDialogOpen] = useState(false);

    const tilgjengeligeUkedager = useMemo(
        () => finnTilgjengeligeUkedager(datoFra, datoTil),
        [datoFra, datoTil]
    );

    // Sync "alle X" → valgte lister
    useEffect(() => {
        if (alleBaner) setValgteBaner(baner.map((b) => b.id));
    }, [alleBaner, baner]);

    useEffect(() => {
        if (alleUkedager) setValgteUkedager(tilgjengeligeUkedager);
    }, [alleUkedager, tilgjengeligeUkedager]);

    useEffect(() => {
        if (alleTidspunkter) setValgteTidspunkter(tilgjengeligeTidspunkter);
    }, [alleTidspunkter, tilgjengeligeTidspunkter]);

    // Når dato-periode endres: fjern ukedager som ikke lenger er gyldige
    useEffect(() => {
        setValgteUkedager((prev) => prev.filter((d) => tilgjengeligeUkedager.includes(d)));
        // Hvis "alleUkedager" er på, settes den i sync-effekten over.
    }, [tilgjengeligeUkedager]);

    const toggle = (item: string, set: React.Dispatch<React.SetStateAction<string[]>>) => {
        set((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
    };

    const dtoOrNull = () =>
        byggDto({
            datoFra,
            datoTil,
            valgteBaner,
            valgteUkedager,
            valgteTidspunkter,
            kategori,
            beskrivelse,
            onWarning: (msg) => toast.warning(msg),
        });

    const åpneForhandsvisning = async () => {
        const dto = dtoOrNull();
        if (!dto) return;

        setDialogOpen(true);
        await forhandsvis(dto);
    };

    const håndterOpprett = async () => {
        const dto = dtoOrNull();
        if (!dto) return;

        await opprett(dto);
        clearForhandsvisning();
        setDialogOpen(false);
    };

    if (isLoading) return <LoaderSkeleton />;

    return (
        <ArrangementContent
            kategorier={KATEGORIER}
            kategori={kategori}
            beskrivelse={beskrivelse}
            datoFra={datoFra}
            datoTil={datoTil}
            baner={baner}
            tilgjengeligeUkedager={tilgjengeligeUkedager}
            tilgjengeligeTidspunkter={tilgjengeligeTidspunkter}
            valgteBaner={valgteBaner}
            valgteUkedager={valgteUkedager}
            valgteTidspunkter={valgteTidspunkter}
            alleBaner={alleBaner}
            alleUkedager={alleUkedager}
            alleTidspunkter={alleTidspunkter}
            dialogOpen={dialogOpen}
            forhandsvisning={forhandsvisning}
            isLoadingForhandsvisning={isLoadingForhandsvisning}
            onChangeKategori={setKategori}
            onChangeBeskrivelse={setBeskrivelse}
            onChangeDatoFra={setDatoFra}
            onChangeDatoTil={setDatoTil}
            onToggleAlleBaner={setAlleBaner}
            onToggleAlleUkedager={setAlleUkedager}
            onToggleAlleTidspunkter={setAlleTidspunkter}
            onToggleBane={(id) => toggle(id, setValgteBaner)}
            onToggleUkedag={(dag) => toggle(dag, setValgteUkedager)}
            onToggleTidspunkt={(tid) => toggle(tid, setValgteTidspunkter)}
            onOpenPreview={åpneForhandsvisning}
            onCreate={håndterOpprett}
            onDialogOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) clearForhandsvisning();
            }}
        />
    );
}
