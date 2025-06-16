import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    ukedager,
    dagNavnTilEnum,
    tilDatoTekst,
    enumTilDagNavn,
    dagIndexTilBackendUkedag,
    finnUkedagerIDatoPeriode,
    formatDatoKort,
} from '../../utils/datoUtils.js';
import { useArrangement } from '../../hooks/useArrangement.js';
import type { OpprettArrangementDto } from '../../types/index.js';

import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table.js';
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from '@/components/ui/tabs.js';
import { Button } from '@/components/ui/button.js';
import { Checkbox } from '@/components/ui/checkbox.js';
import { Label } from '@/components/ui/label.js';
import DatoVelger from '../../components/DatoVelger.js';
import { Input } from '@/components/ui/input.js';
import { toast } from 'sonner';
import LoaderSkeleton from '../../components/LoaderSkeleton.js';
import { Card, CardContent } from '@/components/ui/card.js';

export default function ArrangementPage() {
    const { slug } = useParams<{ slug: string }>();
    const {
        baner,
        tilgjengeligeTidspunkter,
        forhandsvisning,
        setForhandsvisning,
        forhandsvis,
        opprett,
        isLoading,
    } = useArrangement(slug);

    const [valgteBaner, setValgteBaner] = useState<string[]>([]);
    const [valgteUkedager, setValgteUkedager] = useState<string[]>([]);
    const [valgteTidspunkter, setValgteTidspunkter] = useState<string[]>([]);
    const [datoFra, setDatoFra] = useState<Date | null>(new Date());
    const [datoTil, setDatoTil] = useState<Date | null>(new Date());
    const [alleBaner, setAlleBaner] = useState(false);
    const [alleUkedager, setAlleUkedager] = useState(false);
    const [alleTidspunkter, setAlleTidspunkter] = useState(false);
    const [kategori, setKategori] = useState('Annet');
    const [beskrivelse, setBeskrivelse] = useState('');
    const [activeTab, setActiveTab] = useState('oppsett');

    const nullstillForhandsvisning = () =>
        setForhandsvisning({ ledige: [], konflikter: [] });

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

    const toggle = (
        item: string,
        set: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        set((prev) =>
            prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
        );
    };

    function byggDto(): OpprettArrangementDto | null {
        if (!datoFra || !datoTil) {
            toast.warning('Du må velge start- og sluttdato');
            return null;
        }

        if (valgteBaner.length === 0) {
            toast.warning('Du må velge minst én bane');
            return null;
        }

        if (valgteTidspunkter.length === 0) {
            toast.warning('Du må velge minst ett tidspunkt');
            return null;
        }

        if (valgteUkedager.length === 0) {
            toast.warning('Du må velge minst én ukedag');
            return null;
        }

        const faktiskeUkedager = finnUkedagerIDatoPeriode(datoFra, datoTil);
        const backendUkedager = valgteUkedager
            .map((d) => dagNavnTilEnum[d])
            .filter((d) => faktiskeUkedager.has(d));

        if (backendUkedager.length === 0) {
            toast.warning('Ingen av de valgte ukedagene finnes i datointervallet');
            return null;
        }

        return {
            tittel: kategori,
            beskrivelse,
            kategori: kategori as OpprettArrangementDto['kategori'],
            startDato: tilDatoTekst(datoFra),
            sluttDato: tilDatoTekst(datoTil),
            ukedager: backendUkedager,
            tidspunkter: valgteTidspunkter,
            baneIder: valgteBaner,
        };
    }

    const håndterOpprett = async () => {
        const dto = byggDto();
        if (dto) {
            await opprett(dto);
            nullstillForhandsvisning();
            setActiveTab('oppsett');
        }
    };

    const håndterTabChange = async (valgt: string) => {
        setActiveTab(valgt);
        if (valgt === 'forhandsvisning') {
            const dto = byggDto();
            if (dto) await forhandsvis(dto);
        }
    };

    const alleSlots = [...forhandsvisning.ledige, ...forhandsvisning.konflikter].sort(
        (a, b) =>
            a.dato.localeCompare(b.dato) ||
            a.startTid.localeCompare(b.startTid) ||
            a.baneId.localeCompare(b.baneId)
    );

    return (
        <div className="max-w-screen-md mx-auto px-1 py-1">
            {isLoading ? (
                <LoaderSkeleton />
            ) : (
                <Tabs value={activeTab} onValueChange={håndterTabChange}>
                    <TabsList className="mb-4">
                        <TabsTrigger value="oppsett">Oppsett</TabsTrigger>
                        <TabsTrigger value="forhandsvisning" disabled={valgteBaner.length === 0}>
                            Forhåndsvisning ({forhandsvisning.ledige.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="oppsett">
                        <Card>
                            <CardContent className="p-4 space-y-4">
                                <div>
                                    <Label>Kategori</Label>
                                    <select
                                        className="w-full border rounded text-sm px-3 py-2 mt-1"
                                        value={kategori}
                                        onChange={(e) => setKategori(e.target.value)}
                                    >
                                        {[
                                            'Trening',
                                            'Turnering',
                                            'Klubbmersterskap',
                                            'Kurs',
                                            'Lagkamp',
                                            'Stigespill',
                                            'Dugnad',
                                            'Vedlikehold',
                                            'Sosialt',
                                            'Annet',
                                        ].map((k) => (
                                            <option key={k} value={k}>
                                                {k}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label>Beskrivelse</Label>
                                    <Input
                                        type="text"
                                        className="w-full text-sm mt-1"
                                        value={beskrivelse}
                                        onChange={(e) => setBeskrivelse(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label>Fra</Label>
                                    <DatoVelger value={datoFra} onChange={setDatoFra} visNavigering />
                                </div>

                                <div>
                                    <Label>Til</Label>
                                    <DatoVelger value={datoTil} onChange={setDatoTil} visNavigering />
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="alleBaner"
                                            checked={alleBaner}
                                            onCheckedChange={(val) => setAlleBaner(!!val)}
                                        />
                                        <Label htmlFor="alleBaner">Alle baner</Label>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {baner.map((b) => (
                                            <Button
                                                key={b.id}
                                                variant={valgteBaner.includes(b.id) ? 'default' : 'outline'}
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
                                        <Label htmlFor="alleUkedager">Alle gyldige dager</Label>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {ukedager.map((dag) => (
                                            <Button
                                                key={dag}
                                                variant={valgteUkedager.includes(dag) ? 'default' : 'outline'}
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
                                        <Label htmlFor="alleTidspunkter">Alle tidspunkter</Label>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {tilgjengeligeTidspunkter.map((tid) => (
                                            <Button
                                                key={tid}
                                                variant={valgteTidspunkter.includes(tid) ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => toggle(tid, setValgteTidspunkter)}
                                                disabled={alleTidspunkter}
                                            >
                                                {tid}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="forhandsvisning">
                        <Card>
                            <CardContent className="p-4 space-y-4">
                                {alleSlots.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">
                                        Ingen bookinger tilgjengelig.
                                    </p>
                                ) : (
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
                                                                className={erKonflikt ? 'bg-yellow-100' : ''}
                                                            >
                                                                <TableCell>{formatDatoKort(slot.dato)}</TableCell>
                                                                <TableCell>
                                                                    {slot.startTid} – {slot.sluttTid}
                                                                </TableCell>
                                                                <TableCell>{bane?.navn ?? '(ukjent bane)'}</TableCell>
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
                                        <div className="flex justify-end mt-3">
                                            <Button type="button" onClick={håndterOpprett} disabled={isLoading}>
                                                Opprett {forhandsvisning.ledige.length} bookinger
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>
            )}
        </div>
    );
}
