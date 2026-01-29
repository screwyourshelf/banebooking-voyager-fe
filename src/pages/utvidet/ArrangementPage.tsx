import { useState, useMemo, useEffect } from "react";
import {
    ukedager,
    dagNavnTilEnum,
    tilDatoTekst,
    enumTilDagNavn,
    dagIndexTilBackendUkedag,
    finnUkedagerIDatoPeriode,
    formatDatoKort,
} from "../../utils/datoUtils.js";
import { useArrangement } from "../../hooks/useArrangement.js";
import type { OpprettArrangementDto } from "../../types/index.js";

import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table.js";
import { Button } from "@/components/ui/button.js";
import { Checkbox } from "@/components/ui/checkbox.js";
import DatoVelger from "../../components/DatoVelger.js";
import { toast } from "sonner";
import LoaderSkeleton from "../../components/LoaderSkeleton.js";
import { Card, CardContent } from "@/components/ui/card.js";
import { FormField } from "@/components/FormField.js";
import { SelectField } from "@/components/SelectField.js";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog.js";

export default function ArrangementPage() {
    const {
        baner,
        tilgjengeligeTidspunkter,
        forhandsvisning,
        forhandsvis,
        clearForhandsvisning,
        opprett,
        isLoading,
        isLoadingForhandsvisning,
        // valgfritt hvis du la til dette:
        // forhandsvisError,
    } = useArrangement();

    const [valgteBaner, setValgteBaner] = useState<string[]>([]);
    const [valgteUkedager, setValgteUkedager] = useState<string[]>([]);
    const [valgteTidspunkter, setValgteTidspunkter] = useState<string[]>([]);
    const [datoFra, setDatoFra] = useState<Date | null>(new Date());
    const [datoTil, setDatoTil] = useState<Date | null>(new Date());
    const [alleBaner, setAlleBaner] = useState(false);
    const [alleUkedager, setAlleUkedager] = useState(false);
    const [alleTidspunkter, setAlleTidspunkter] = useState(false);
    const [kategori, setKategori] = useState("Annet");
    const [beskrivelse, setBeskrivelse] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);

    const tilgjengeligeUkedager = useMemo(() => {
        if (!datoFra || !datoTil) return ukedager;

        const dager = new Set<string>();
        const fra = new Date(datoFra);
        const til = new Date(datoTil);

        for (let d = new Date(fra); d <= til; d.setDate(d.getDate() + 1)) {
            const idx = d.getDay();
            const backendUkedag = dagIndexTilBackendUkedag[idx];
            const norskKort = enumTilDagNavn[backendUkedag];
            if (norskKort) dager.add(norskKort);
        }

        return ukedager.filter((d) => dager.has(d));
    }, [datoFra, datoTil]);

    useEffect(() => {
        if (alleBaner) setValgteBaner(baner.map((b) => b.id));
        if (alleUkedager) setValgteUkedager(tilgjengeligeUkedager);
        if (alleTidspunkter) setValgteTidspunkter(tilgjengeligeTidspunkter);
    }, [
        alleBaner,
        alleUkedager,
        alleTidspunkter,
        baner,
        tilgjengeligeUkedager,
        tilgjengeligeTidspunkter,
    ]);

    const toggle = (item: string, set: React.Dispatch<React.SetStateAction<string[]>>) => {
        set((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
    };

    function byggDto(): OpprettArrangementDto | null {
        if (!datoFra || !datoTil) {
            toast.warning("Du må velge start- og sluttdato");
            return null;
        }
        if (valgteBaner.length === 0) {
            toast.warning("Du må velge minst én bane");
            return null;
        }
        if (valgteTidspunkter.length === 0) {
            toast.warning("Du må velge minst ett tidspunkt");
            return null;
        }
        if (valgteUkedager.length === 0) {
            toast.warning("Du må velge minst én ukedag");
            return null;
        }

        const faktiskeUkedager = finnUkedagerIDatoPeriode(datoFra, datoTil);
        const backendUkedager = valgteUkedager
            .map((d) => dagNavnTilEnum[d])
            .filter((d) => faktiskeUkedager.has(d));

        if (backendUkedager.length === 0) {
            toast.warning("Ingen av de valgte ukedagene finnes i datointervallet");
            return null;
        }

        return {
            tittel: kategori,
            beskrivelse,
            kategori: kategori as OpprettArrangementDto["kategori"],
            startDato: tilDatoTekst(datoFra),
            sluttDato: tilDatoTekst(datoTil),
            ukedager: backendUkedager,
            tidspunkter: valgteTidspunkter,
            baneIder: valgteBaner,
        };
    }

    const alleSlots = useMemo(() => {
        return [...forhandsvisning.ledige, ...forhandsvisning.konflikter].sort(
            (a, b) =>
                a.dato.localeCompare(b.dato) ||
                a.startTid.localeCompare(b.startTid) ||
                a.baneId.localeCompare(b.baneId)
        );
    }, [forhandsvisning]);

    const harSlots = alleSlots.length > 0;

    const håndterOpprett = async () => {
        const dto = byggDto();
        if (!dto) return;

        await opprett(dto);
        clearForhandsvisning();
        setDialogOpen(false);
    };

    const åpneForhandsvisning = async () => {
        const dto = byggDto();
        if (!dto) return;

        setDialogOpen(true); // åpne med en gang, så kan vi vise "laster..."
        await forhandsvis(dto); // trigger useApiPostQuery (POST-query)
    };

    if (isLoading) return <LoaderSkeleton />;

    return (
        <div className="max-w-screen-md mx-auto px-1 py-1">
            <Card>
                <CardContent className="p-4 space-y-4">
                    <SelectField
                        id="kategori"
                        label="Kategori"
                        value={kategori}
                        onChange={(val) => setKategori(val)}
                        options={[
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
                        ].map((k) => ({ label: k, value: k }))}
                    />

                    <FormField
                        id="beskrivelse"
                        label="Beskrivelse"
                        value={beskrivelse}
                        onChange={(e) => setBeskrivelse(e.target.value)}
                    />

                    <div>
                        <label className="text-sm font-medium">Fra</label>
                        <DatoVelger value={datoFra} onChange={setDatoFra} visNavigering />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Til</label>
                        <DatoVelger value={datoTil} onChange={setDatoTil} visNavigering />
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="alleBaner"
                                checked={alleBaner}
                                onCheckedChange={(val) => setAlleBaner(!!val)}
                            />
                            <label htmlFor="alleBaner" className="text-sm">
                                Alle baner
                            </label>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                            {baner.map((b) => (
                                <Button
                                    key={b.id}
                                    variant={valgteBaner.includes(b.id) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggle(b.id, setValgteBaner)}
                                    disabled={alleBaner}
                                >
                                    {b.navn}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="alleUkedager"
                                checked={alleUkedager}
                                onCheckedChange={(val) => setAlleUkedager(!!val)}
                            />
                            <label htmlFor="alleUkedager" className="text-sm">
                                Alle gyldige dager
                            </label>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                            {ukedager.map((dag) => (
                                <Button
                                    key={dag}
                                    variant={valgteUkedager.includes(dag) ? "default" : "outline"}
                                    size="sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggle(dag, setValgteUkedager);
                                    }}
                                    disabled={alleUkedager || !tilgjengeligeUkedager.includes(dag)}
                                >
                                    {dag}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="alleTidspunkter"
                                checked={alleTidspunkter}
                                onCheckedChange={(val) => setAlleTidspunkter(!!val)}
                            />
                            <label htmlFor="alleTidspunkter" className="text-sm">
                                Alle tidspunkter
                            </label>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                            {tilgjengeligeTidspunkter.map((tid) => (
                                <Button
                                    key={tid}
                                    variant={valgteTidspunkter.includes(tid) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggle(tid, setValgteTidspunkter)}
                                    disabled={alleTidspunkter}
                                >
                                    {tid}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="button" onClick={åpneForhandsvisning}>
                            Forhåndsvis bookinger
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) {
                        clearForhandsvisning(); // cancel + fjern cache (fra hooken)
                    }
                }}
            >
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Forhåndsvis bookingene</DialogTitle>
                    </DialogHeader>

                    {isLoadingForhandsvisning ? (
                        <p className="text-muted-foreground italic">Laster forhåndsvisning…</p>
                    ) : harSlots ? (
                        <>
                            <div className="overflow-auto max-h-[60vh] border rounded-md">
                                <Table className="text-sm">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Dato</TableHead>
                                            <TableHead>Klokkeslett</TableHead>
                                            <TableHead>Bane</TableHead>
                                            <TableHead>Beskrivelse</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {alleSlots.map((slot) => {
                                            const bane = baner.find((b) => b.id === slot.baneId);
                                            const erKonflikt = forhandsvisning.konflikter.some(
                                                (k) =>
                                                    k.baneId === slot.baneId &&
                                                    k.dato === slot.dato &&
                                                    k.startTid === slot.startTid &&
                                                    k.sluttTid === slot.sluttTid
                                            );

                                            return (
                                                <TableRow
                                                    key={`${slot.dato}-${slot.baneId}-${slot.startTid}`}
                                                    className={erKonflikt ? "bg-yellow-100" : ""}
                                                >
                                                    <TableCell>{formatDatoKort(slot.dato)}</TableCell>
                                                    <TableCell>
                                                        {slot.startTid} – {slot.sluttTid}
                                                    </TableCell>
                                                    <TableCell>{bane?.navn ?? "(ukjent bane)"}</TableCell>
                                                    <TableCell>
                                                        {beskrivelse}
                                                        {erKonflikt && (
                                                            <span className="ml-2 text-yellow-700 text-xs italic">
                                                                (Konflikt)
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            <DialogFooter className="mt-3">
                                <Button type="button" onClick={håndterOpprett} disabled={isLoadingForhandsvisning}>
                                    Opprett {forhandsvisning.ledige.length} bookinger
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <p className="text-muted-foreground italic">Ingen bookinger å vise.</p>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
