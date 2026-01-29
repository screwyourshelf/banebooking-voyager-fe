import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import LoaderSkeleton from "@/components/LoaderSkeleton";
import SettingsSection from "@/components/SettingsSection";
import SettingsList from "@/components/SettingsList";
import SettingsRow from "@/components/SettingsRow";
import SettingsInput from "@/components/SettingsInput";
import SettingsTextarea from "@/components/SettingsTextarea";
import { useKlubb } from "@/hooks/useKlubb";

type Props = { slug: string };

export default function KlubbInfoTab({ slug }: Props) {
    const { data: klubb, isLoading, oppdaterKlubb } = useKlubb(slug);

    const [form, setForm] = useState({
        navn: "",
        kontaktEpost: "",
        banereglement: "",
        latitude: "",
        longitude: "",
        feedUrl: "",
        feedSynligAntallDager: "",
    });

    useEffect(() => {
        if (!klubb) return;

        setForm({
            navn: klubb.navn ?? "",
            kontaktEpost: klubb.kontaktEpost ?? "",
            banereglement: klubb.banereglement ?? "",
            latitude: klubb.latitude?.toString() ?? "",
            longitude: klubb.longitude?.toString() ?? "",
            feedUrl: klubb.feedUrl ?? "",
            feedSynligAntallDager: (klubb.feedSynligAntallDager ?? 50).toString(),
        });
    }, [klubb]);

    const canSubmit = useMemo(() => {
        if (!klubb) return false;
        // enkel “dirty check” – kan forbedres senere
        return (
            (form.navn ?? "") !== (klubb.navn ?? "") ||
            (form.kontaktEpost ?? "") !== (klubb.kontaktEpost ?? "") ||
            (form.banereglement ?? "") !== (klubb.banereglement ?? "") ||
            (form.latitude ?? "") !== (klubb.latitude?.toString() ?? "") ||
            (form.longitude ?? "") !== (klubb.longitude?.toString() ?? "") ||
            (form.feedUrl ?? "") !== (klubb.feedUrl ?? "") ||
            (form.feedSynligAntallDager ?? "") !== ((klubb.feedSynligAntallDager ?? 50).toString())
        );
    }, [klubb, form]);

    if (isLoading || !klubb) return <LoaderSkeleton />;

    function parseOptionalNumber(text: string): number | undefined {
        const t = text.trim();
        if (!t) return undefined;
        const n = Number(t.replace(",", "."));
        return Number.isFinite(n) ? n : undefined;
    }

    return (
        <form
            className="space-y-4"
            onSubmit={(e) => {
                e.preventDefault();

                const lat = parseOptionalNumber(form.latitude);
                const lon = parseOptionalNumber(form.longitude);
                const feedDays = parseOptionalNumber(form.feedSynligAntallDager);

                oppdaterKlubb.mutate({
                    ...klubb,
                    navn: form.navn,
                    kontaktEpost: form.kontaktEpost,
                    banereglement: form.banereglement,

                    // ✅ ikke send null/undefined inn i number-felt: behold eksisterende hvis tom/ugyldig
                    latitude: lat ?? klubb.latitude,
                    longitude: lon ?? klubb.longitude,

                    feedUrl: form.feedUrl,
                    feedSynligAntallDager: (feedDays ?? klubb.feedSynligAntallDager ?? 50) as number,
                });
            }}
        >
            <SettingsSection title="Grunninfo" description="Informasjon som vises utad i Banebooking.">
                <SettingsList>
                    <SettingsRow
                        title="Klubbnavn"
                        description="Navnet på klubben slik det vises utad i Banebooking."
                    >
                        <SettingsInput
                            value={form.navn}
                            onChange={(navn) => setForm((f) => ({ ...f, navn }))}
                            placeholder="Ås tennisklubb"
                            autoComplete="organization"
                        />
                    </SettingsRow>

                    <SettingsRow
                        title="Kontakt-e-post"
                        description="Vises på klubbens infoside. Brukes til henvendelser fra medlemmer og gjester."
                    >
                        <SettingsInput
                            value={form.kontaktEpost}
                            onChange={(kontaktEpost) => setForm((f) => ({ ...f, kontaktEpost }))}
                            placeholder="post@klubb.no"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                        />
                    </SettingsRow>
                </SettingsList>
            </SettingsSection>

            <SettingsSection title="Kart" description="Valgfrie innstillinger for innhenting av værinformasjon.">
                <SettingsList>
                    <SettingsRow title="Latitude (breddegrad)" description="">
                        <SettingsInput
                            value={form.latitude}
                            onChange={(latitude) => setForm((f) => ({ ...f, latitude }))}
                            placeholder="f.eks. 59.6552"
                            inputMode="decimal"
                        />
                    </SettingsRow>

                    <SettingsRow title="Longitude (lengdegrad)" description="">
                        <SettingsInput
                            value={form.longitude}
                            onChange={(longitude) => setForm((f) => ({ ...f, longitude }))}
                            placeholder="f.eks. 10.7769"
                            inputMode="decimal"
                        />
                    </SettingsRow>

                </SettingsList>
            </SettingsSection>

            <SettingsSection title="Feed" description="Valgfrie innstillinger for innhenting nyheter fra klubbens RSS-feed.">
                <SettingsList>
                    <SettingsRow
                        title="RSS-feed"
                        description="URL til klubbens RSS-feed (f.eks. nyheter). Hvis satt, hentes og vises de nyeste innleggene i appen."
                    >
                        <SettingsInput
                            value={form.feedUrl}
                            onChange={(feedUrl) => setForm((f) => ({ ...f, feedUrl }))}
                            placeholder="https://www.aastk.no/?feed=rss2"
                            inputMode="url"
                            type="url"
                        />
                    </SettingsRow>

                    <SettingsRow
                        title="Aldergrense for feedinnslag (dager)"
                        description="Hvor mange dager gamle innslag som vises. Sett til 0 for å inkludere alle."
                    >
                        <SettingsInput
                            value={form.feedSynligAntallDager}
                            onChange={(feedSynligAntallDager) =>
                                setForm((f) => ({ ...f, feedSynligAntallDager }))
                            }
                            type="number"
                            inputMode="numeric"
                            min={0}
                            step={1}
                        />
                    </SettingsRow>
                </SettingsList>
            </SettingsSection>

            <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={!canSubmit || oppdaterKlubb.isPending}>
                    {oppdaterKlubb.isPending ? "Lagrer..." : "Lagre endringer"}
                </Button>
            </div>
        </form>
    );
}
