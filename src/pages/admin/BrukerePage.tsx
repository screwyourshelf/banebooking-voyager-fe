import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useBruker } from '../../hooks/useBruker.js';
import { useAdminBrukere } from '../../hooks/useAdminBrukere.js';
import { oppdaterRolle } from '../../api/adminBruker.js';

import { Input } from '@/components/ui/input.js';
import { Label } from '@/components/ui/label.js';
import { Button } from '@/components/ui/button.js';
import { Card, CardContent } from '@/components/ui/card.js';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.js';
import LoaderSkeleton from '@/components/LoaderSkeleton.js';

import type { RolleType } from '../../types/index.js';

export default function BrukerePage() {
    const { slug } = useParams<{ slug: string }>();
    const { bruker, laster: lasterBruker } = useBruker(slug);
    const [query, setQuery] = useState('');

    const { brukere, laster: lasterListe, feil } = useAdminBrukere(slug, query);
    const [endringer, setEndringer] = useState<Record<string, RolleType>>({});
    const [lagretRolle, setLagretRolle] = useState<Record<string, RolleType>>({});

    const erKlubbAdmin = bruker?.roller.includes('KlubbAdmin');

    const handleRolleChange = (id: string, valgtRolle: RolleType) => {
        setEndringer((prev) => ({
            ...prev,
            [id]: valgtRolle,
        }));
    };

    const handleAvbryt = (id: string) => {
        setEndringer((prev) => {
            const ny = { ...prev };
            delete ny[id];
            return ny;
        });
    };

    const handleLagre = async (id: string) => {
        if (!slug) return;
        const valgtRolle = endringer[id];
        if (!valgtRolle) return;

        try {
            await oppdaterRolle(slug, id, valgtRolle);
            toast.success('Rolle oppdatert');

            setLagretRolle((prev) => ({
                ...prev,
                [id]: valgtRolle,
            }));

            setEndringer((prev) => {
                const ny = { ...prev };
                delete ny[id];
                return ny;
            });
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error('Ukjent feil ved oppdatering');
            }
        }
    };

    useEffect(() => {
        setEndringer({});
    }, [query]);

    if (lasterBruker) return <LoaderSkeleton />;

    if (!erKlubbAdmin) {
        return (
            <p className="text-sm text-destructive px-2 py-2 text-center">
                Du har ikke tilgang til denne siden.
            </p>
        );
    }

    return (
        <div className="max-w-screen-sm mx-auto px-2 py-2 space-y-4">
            <Card>
                <CardContent className="p-4 space-y-4">
                    <div>
                        <Label htmlFor="sok">Søk etter bruker</Label>
                        <Input
                            id="sok"
                            placeholder="f.eks. navn eller e-post"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                }
                            }}
                        />
                    </div>

                    {lasterListe && <p>Laster brukere...</p>}
                    {!lasterListe && feil && (
                        <p className="text-red-600">{feil}</p>
                    )}
                    {!lasterListe && brukere.length === 0 && !feil && (
                        <p className="text-muted-foreground">Ingen brukere funnet</p>
                    )}

                    {brukere.map((b) => {
                        const erMeg = b.id === bruker?.id;
                        const lagret = lagretRolle[b.id] ?? b.roller[0] ?? 'Medlem';
                        const valgt = endringer[b.id] ?? lagret;
                        const erEndret = valgt !== lagret;

                        return (
                            <div key={b.id} className="border rounded p-3 space-y-2">
                                <div className="font-medium">{b.epost}</div>
                                <div className="text-sm text-muted-foreground">
                                    Nåværende rolle: <strong>{lagret}</strong>
                                </div>

                                <Label htmlFor={`rolle-${b.id}`} className="text-sm">
                                    {erMeg
                                        ? 'Du kan ikke endre din egen rolle'
                                        : 'Endre rolle'}
                                </Label>

                                <div className="flex items-center gap-2 flex-wrap">
                                    <Select
                                        value={valgt}
                                        onValueChange={(val) =>
                                            handleRolleChange(b.id, val as RolleType)
                                        }
                                        disabled={erMeg}
                                    >
                                        <SelectTrigger id={`rolle-${b.id}`} className="w-[180px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Medlem">Medlem</SelectItem>
                                            <SelectItem value="Utvidet">Utvidet</SelectItem>
                                            <SelectItem value="KlubbAdmin">KlubbAdmin</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {!erMeg && (
                                        <>
                                            <Button
                                                size="sm"
                                                onClick={() => handleLagre(b.id)}
                                                disabled={!erEndret}
                                            >
                                                Lagre
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleAvbryt(b.id)}
                                                disabled={!erEndret}
                                            >
                                                Avbryt
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    );
}
