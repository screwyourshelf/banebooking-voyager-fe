import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { oppdaterKlubb } from '../../api/klubb.js';
import { useKlubb } from '../../hooks/useKlubb.js';

import { Button } from '@/components/ui/button.js';
import { Card, CardContent } from '@/components/ui/card.js';
import LoaderSkeleton from '@/components/LoaderSkeleton.js';

import { FormField } from '@/components/FormField.js';
import { TextareaField } from '@/components/TextareaField.js';
import { SelectField } from '@/components/SelectField.js';
import { RangeField } from '@/components/RangeField.js';

export default function KlubbPage() {
    const { slug } = useParams<{ slug: string }>();
    const { klubb, laster } = useKlubb(slug);

    const [form, setForm] = useState({
        navn: '',
        kontaktEpost: '',
        banereglement: '',
        latitude: '',
        longitude: '',
        feedUrl: '',
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
            toast.error(error instanceof Error ? error.message : 'Ukjent feil');
        }

        setLagrer(false);
    }

    if (laster) return <LoaderSkeleton />;
    if (!klubb) return <p className="text-sm text-destructive px-2 py-2 text-center">Fant ikke klubb.</p>;

    return (
        <div className="max-w-screen-sm mx-auto px-2 py-2">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <FormField
                            id="navn"
                            label="Navn"
                            value={form.navn}
                            onChange={e => setForm(f => ({ ...f, navn: e.target.value }))}
                        />
                        <FormField
                            id="kontaktEpost"
                            label="Kontakt-e-post"
                            type="email"
                            value={form.kontaktEpost}
                            onChange={e => setForm(f => ({ ...f, kontaktEpost: e.target.value }))}
                        />
                        <TextareaField
                            id="banereglement"
                            label="Banereglement"
                            value={form.banereglement}
                            onChange={e => setForm(f => ({ ...f, banereglement: e.target.value }))}
                        />
                        <FormField
                            id="latitude"
                            label="Latitude"
                            value={form.latitude}
                            onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))}
                        />
                        <FormField
                            id="longitude"
                            label="Longitude"
                            value={form.longitude}
                            onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))}
                        />
                        <FormField
                            id="feedUrl"
                            label="RSS-feed (valgfritt)"
                            value={form.feedUrl}
                            onChange={e => setForm(f => ({ ...f, feedUrl: e.target.value }))}
                        />

                        <div className="space-y-3 pt-2">
                            <h3 className="text-sm font-medium">Bookingregler</h3>

                            <RangeField
                                id="maksPerDag"
                                label="Maks bookinger per dag"
                                value={form.bookingRegel.maksPerDag}
                                onChange={val =>
                                    setForm(f => ({
                                        ...f,
                                        bookingRegel: { ...f.bookingRegel, maksPerDag: val },
                                    }))
                                }
                                min={0}
                                max={5}
                            />

                            <RangeField
                                id="maksTotalt"
                                label="Maks aktive bookinger totalt"
                                value={form.bookingRegel.maksTotalt}
                                onChange={val =>
                                    setForm(f => ({
                                        ...f,
                                        bookingRegel: { ...f.bookingRegel, maksTotalt: val },
                                    }))
                                }
                                min={0}
                                max={10}
                            />

                            <RangeField
                                id="dagerFremITid"
                                label="Dager frem i tid tillatt"
                                value={form.bookingRegel.dagerFremITid}
                                onChange={val =>
                                    setForm(f => ({
                                        ...f,
                                        bookingRegel: { ...f.bookingRegel, dagerFremITid: val },
                                    }))
                                }
                                min={1}
                                max={14}
                            />

                            <SelectField
                                id="slotLengdeMinutter"
                                label="Slot-lengde (minutter)"
                                value={form.bookingRegel.slotLengdeMinutter.toString()}
                                onChange={val =>
                                    setForm(f => ({
                                        ...f,
                                        bookingRegel: { ...f.bookingRegel, slotLengdeMinutter: parseInt(val) },
                                    }))
                                }
                                options={[
                                    { label: '30 minutter', value: '30' },
                                    { label: '45 minutter', value: '45' },
                                    { label: '60 minutter', value: '60' },
                                    { label: '90 minutter', value: '90' },
                                ]}
                                disabled
                            />
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
