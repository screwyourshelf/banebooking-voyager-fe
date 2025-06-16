import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { oppdaterKlubb } from '../../api/klubb.js'; // Viktig å importere dette
import { useKlubb } from '../../hooks/useKlubb.js';

import { Button } from '@/components/ui/button.js';
import { Input } from '@/components/ui/input.js';
import { Label } from '@/components/ui/label.js';
import { Textarea } from '@/components/ui/textarea.js';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.js';
import { Card, CardContent } from '@/components/ui/card.js';
import LoaderSkeleton from '@/components/LoaderSkeleton.js';

export default function KlubbPage() {
    const { slug } = useParams<{ slug: string }>();
    const { klubb, laster } = useKlubb(slug);

    const [form, setForm] = useState({
        navn: '',
        kontaktEpost: '',
        banereglement: '',
        latitude: '',
        longitude: '',
        feedUrl: '', // ← denne må legges til
        bookingRegel: {
            maksPerDag: 1,
            maksTotalt: 2,
            dagerFremITid: 7,
            slotLengdeMinutter: 60,
        },
    });

    const [lagrer, setLagrer] = useState(false);

    useEffect(() => {
        if (klubb) {
            setForm({
                navn: klubb.navn,
                kontaktEpost: klubb.kontaktEpost ?? '',
                banereglement: klubb.banereglement ?? '',
                latitude: klubb.latitude?.toString() ?? '',
                longitude: klubb.longitude?.toString() ?? '',
                feedUrl: klubb.feedUrl ?? '',
                bookingRegel: {
                    maksPerDag: klubb.bookingRegel?.maksPerDag ?? 1,
                    maksTotalt: klubb.bookingRegel?.maksTotalt ?? 2,
                    dagerFremITid: klubb.bookingRegel?.dagerFremITid ?? 7,
                    slotLengdeMinutter: klubb.bookingRegel?.slotLengdeMinutter ?? 60,
                },
            });
        }
    }, [klubb]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLagrer(true);

        const verdier = { ...form };

        if (verdier.bookingRegel.maksTotalt < verdier.bookingRegel.maksPerDag) {
            toast.error('Totalt antall bookinger kan ikke være lavere enn maks per dag.');
            setLagrer(false);
            return;
        }

        try {
            await oppdaterKlubb(slug!, {
                navn: verdier.navn,
                kontaktEpost: verdier.kontaktEpost,
                banereglement: verdier.banereglement,
                latitude: parseFloat(verdier.latitude),
                longitude: parseFloat(verdier.longitude),
                feedUrl: verdier.feedUrl,
                bookingRegel: { ...verdier.bookingRegel },
            });
            toast.success('Endringer lagret');
        } catch (error: unknown) {
            if (error instanceof Error) toast.error(error.message);
            else toast.error('Ukjent feil');
        }

        setLagrer(false);
    }

    if (laster) return <LoaderSkeleton />;

    if (!klubb) {
        return (
            <p className="text-sm text-destructive px-2 py-2 text-center">
                Fant ikke klubb.
            </p>
        );
    }

    return (
        <div className="max-w-screen-sm mx-auto px-2 py-2">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Card>
                    <CardContent className="p-4 space-y-4">

                        <div>
                            <Label htmlFor="navn">Navn</Label>
                            <Input
                                id="navn"
                                value={form.navn}
                                onChange={e => setForm(f => ({ ...f, navn: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="kontaktEpost">Kontakt-e-post</Label>
                            <Input
                                id="kontaktEpost"
                                type="email"
                                value={form.kontaktEpost}
                                onChange={e => setForm(f => ({ ...f, kontaktEpost: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="banereglement">Banereglement</Label>
                            <Textarea
                                id="banereglement"
                                rows={3}
                                value={form.banereglement}
                                onChange={e => setForm(f => ({ ...f, banereglement: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="latitude">Latitude</Label>
                            <Input
                                id="latitude"
                                value={form.latitude}
                                onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="longitude">Longitude</Label>
                            <Input
                                id="longitude"
                                value={form.longitude}
                                onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="feedUrl">RSS-feed (valgfritt)</Label>
                            <Input
                                id="feedUrl"
                                value={form.feedUrl}
                                onChange={e => setForm(f => ({ ...f, feedUrl: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-3 pt-2">
                            <h3 className="text-sm font-medium">Bookingregler</h3>

                            <div>
                                <Label htmlFor="maksPerDag">
                                    Maks bookinger per dag: {form.bookingRegel.maksPerDag}
                                </Label>
                                <input
                                    id="maksPerDag"
                                    type="range"
                                    min={0}
                                    max={5}
                                    step={1}
                                    value={form.bookingRegel.maksPerDag}
                                    onChange={e =>
                                        setForm(f => ({
                                            ...f,
                                            bookingRegel: { ...f.bookingRegel, maksPerDag: parseInt(e.target.value) },
                                        }))
                                    }
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <Label htmlFor="maksTotalt">
                                    Maks aktive bookinger totalt: {form.bookingRegel.maksTotalt}
                                </Label>
                                <input
                                    id="maksTotalt"
                                    type="range"
                                    min={0}
                                    max={10}
                                    step={1}
                                    value={form.bookingRegel.maksTotalt}
                                    onChange={e =>
                                        setForm(f => ({
                                            ...f,
                                            bookingRegel: { ...f.bookingRegel, maksTotalt: parseInt(e.target.value) },
                                        }))
                                    }
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <Label htmlFor="dagerFremITid">
                                    Dager frem i tid tillatt: {form.bookingRegel.dagerFremITid}
                                </Label>
                                <input
                                    id="dagerFremITid"
                                    type="range"
                                    min={1}
                                    max={14}
                                    step={1}
                                    value={form.bookingRegel.dagerFremITid}
                                    onChange={e =>
                                        setForm(f => ({
                                            ...f,
                                            bookingRegel: { ...f.bookingRegel, dagerFremITid: parseInt(e.target.value) },
                                        }))
                                    }
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <Label htmlFor="slotLengdeMinutter">Slot-lengde (minutter)</Label>
                                <Select
                                    value={form.bookingRegel.slotLengdeMinutter.toString()}
                                    onValueChange={value =>
                                        setForm(f => ({
                                            ...f,
                                            bookingRegel: { ...f.bookingRegel, slotLengdeMinutter: parseInt(value) },
                                        }))
                                    }
                                    disabled
                                >
                                    <SelectTrigger id="slotLengdeMinutter" disabled>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="30">30 minutter</SelectItem>
                                        <SelectItem value="45">45 minutter</SelectItem>
                                        <SelectItem value="60">60 minutter</SelectItem>
                                        <SelectItem value="90">90 minutter</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button type="submit" size="sm" disabled={lagrer}>
                                {lagrer ? 'Lagrer...' : 'Lagre endringer'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
