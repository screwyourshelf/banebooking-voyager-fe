import { useState, useEffect } from 'react';
import { useBaner } from '../../hooks/useBaner.js';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button.js';
import { Input } from '@/components/ui/input.js';
import { Label } from '@/components/ui/label.js';
import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue,
    SelectItem,
} from '@/components/ui/select.js';
import { Card, CardContent } from '@/components/ui/card.js';
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from '@/components/ui/tabs.js';

type BaneFormData = {
    navn: string;
    beskrivelse: string;
};

const STORAGE_KEY = 'rediger.valgtBaneId';

export default function BanerPage() {
    const { baner, isLoading, oppdaterBane, opprettBane, deaktiverBane, aktiverBane } = useBaner(true);
    const [redigerte, setRedigerte] = useState<Record<string, BaneFormData>>({});
    const [nyBane, setNyBane] = useState<BaneFormData>({ navn: '', beskrivelse: '' });
    const [valgtBaneId, setValgtBaneId] = useState<string | null>(() => {
        const fraStorage = sessionStorage.getItem(STORAGE_KEY);
        return fraStorage && fraStorage !== 'null' ? fraStorage : null;
    });

    const valgtBane = baner.find(b => b.id === valgtBaneId) ?? null;
    const redigerteVerdier = valgtBaneId ? redigerte[valgtBaneId] ?? null : null;

    useEffect(() => {
        sessionStorage.setItem(STORAGE_KEY, valgtBaneId ?? 'null');
    }, [valgtBaneId]);

    useEffect(() => {
        if (valgtBaneId && !baner.some(b => b.id === valgtBaneId)) {
            setValgtBaneId(null);
        }
    }, [baner, valgtBaneId]);

    function håndterEndring(id: string, felt: keyof BaneFormData, verdi: string) {
        setRedigerte(prev => ({
            ...prev,
            [id]: {
                ...(prev[id] ?? baner.find(b => b.id === id)!),
                [felt]: verdi,
            },
        }));
    }

    async function lagre(id: string) {
        const oppdatert = redigerte[id];
        if (!oppdatert) return;

        try {
            await oppdaterBane(id, oppdatert);
            toast.success('Endringer lagret');
            setRedigerte(prev => {
                const ny = { ...prev };
                delete ny[id];
                return ny;
            });
        } catch {
            toast.error('Kunne ikke lagre bane');
        }
    }

    async function leggTil() {
        if (!nyBane.navn.trim()) {
            toast.error('Navn er påkrevd');
            return;
        }

        try {
            await opprettBane(nyBane);
            toast.success('Bane lagt til');
            setNyBane({ navn: '', beskrivelse: '' });
        } catch {
            toast.error('Kunne ikke legge til bane');
        }
    }

    async function deaktiver(id: string) {
        try {
            await deaktiverBane(id);
            toast.success('Bane deaktivert');
        } catch {
            toast.error('Kunne ikke deaktivere bane');
        }
    }

    async function aktiver(id: string) {
        try {
            await aktiverBane(id);
            toast.success('Bane aktivert');
        } catch {
            toast.error('Kunne ikke aktivere bane');
        }
    }

    return (
        <div className="max-w-screen-sm mx-auto px-2 py-2">
            <Tabs defaultValue="rediger" className="space-y-4">
                <TabsList className="mb-2">
                    <TabsTrigger value="rediger">Rediger bane</TabsTrigger>
                    <TabsTrigger value="ny">Ny bane</TabsTrigger>
                </TabsList>

                <TabsContent value="rediger">
                    {isLoading ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Laster...</p>
                    ) : (
                        <Card>
                            <CardContent className="p-4 space-y-4">
                                <div>
                                    <Label className="mb-1 block text-sm font-medium">Velg bane</Label>
                                    <Select
                                        value={valgtBaneId ?? ''}
                                        onValueChange={value => setValgtBaneId(value || null)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="— Velg bane —" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {baner.map(b => (
                                                <SelectItem key={b.id} value={b.id}>
                                                    {b.navn} {b.aktiv ? '' : '(inaktiv)'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {valgtBane && (
                                    <>
                                        <div>
                                            <Label htmlFor="navn" className="block mb-1">Navn</Label>
                                            <Input
                                                id="navn"
                                                value={redigerteVerdier?.navn ?? valgtBane.navn}
                                                onChange={e => håndterEndring(valgtBane.id, 'navn', e.target.value)}
                                                disabled={!valgtBane.aktiv}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="beskrivelse" className="block mb-1">Beskrivelse</Label>
                                            <Input
                                                id="beskrivelse"
                                                value={redigerteVerdier?.beskrivelse ?? valgtBane.beskrivelse}
                                                onChange={e => håndterEndring(valgtBane.id, 'beskrivelse', e.target.value)}
                                                disabled={!valgtBane.aktiv}
                                            />
                                        </div>

                                        <div className="flex justify-between">
                                            {valgtBane.aktiv ? (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        onClick={e => {
                                                            e.preventDefault();
                                                            lagre(valgtBane.id);
                                                        }}
                                                        disabled={
                                                            !redigerteVerdier ||
                                                            (redigerteVerdier.navn === valgtBane.navn &&
                                                                redigerteVerdier.beskrivelse === valgtBane.beskrivelse)
                                                        }
                                                    >
                                                        Lagre
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={e => {
                                                            e.preventDefault();
                                                            deaktiver(valgtBane.id);
                                                        }}
                                                    >
                                                        Deaktiver
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={e => {
                                                        e.preventDefault();
                                                        aktiver(valgtBane.id);
                                                    }}
                                                >
                                                    Aktiver
                                                </Button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="ny">
                    <Card>
                        <CardContent className="p-4 space-y-3">
                            <div>
                                <Label htmlFor="ny-navn" className="block mb-1">Navn</Label>
                                <Input
                                    id="ny-navn"
                                    value={nyBane.navn}
                                    onChange={e => setNyBane(f => ({ ...f, navn: e.target.value }))}
                                />
                            </div>

                            <div>
                                <Label htmlFor="ny-beskrivelse" className="block mb-1">Beskrivelse</Label>
                                <Input
                                    id="ny-beskrivelse"
                                    value={nyBane.beskrivelse}
                                    onChange={e => setNyBane(f => ({ ...f, beskrivelse: e.target.value }))}
                                />
                            </div>

                            <Button size="sm" onClick={e => {
                                e.preventDefault();
                                leggTil();
                            }}>
                                Legg til
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}