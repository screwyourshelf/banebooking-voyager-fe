import { useEffect, useMemo, useState } from "react";
import LoaderSkeleton from "@/components/LoaderSkeleton";
import { useKlubb } from "@/hooks/useKlubb";

import KlubbInnstillingerContent from "./KlubbInnstillingerContent";

type FormState = {
    navn: string;
    kontaktEpost: string;
    banereglement: string;
    latitude: string;
    longitude: string;
    feedUrl: string;
    feedSynligAntallDager: string;
};

type TouchedState = {
    navn: boolean;
    kontaktEpost: boolean;
};

const MAX_KLUBBNAVN = 60;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateKlubbnavn(navn: string): string | null {
    const v = navn.trim();
    if (!v) return "Klubbnavn kan ikke være tomt.";
    if (v.length < 2) return "Klubbnavn må være minst 2 tegn.";
    if (v.length > MAX_KLUBBNAVN)
        return `Klubbnavn kan ikke være lengre enn ${MAX_KLUBBNAVN} tegn.`;
    return null;
}

function validateKontaktEpost(epost: string): string | null {
    const v = epost.trim();
    if (!v) return "Kontakt-e-post kan ikke være tom.";
    if (!EMAIL_REGEX.test(v)) return "Skriv inn en gyldig e-postadresse.";
    return null;
}

function parseOptionalNumber(text: string): number | undefined {
    const t = text.trim();
    if (!t) return undefined;
    const n = Number(t.replace(",", "."));
    return Number.isFinite(n) ? n : undefined;
}

export default function KlubbInnstillingerView() {
    const { data: klubb, isLoading, OppdaterKlubbForespørsel } = useKlubb();

    const [form, setForm] = useState<FormState>({
        navn: "",
        kontaktEpost: "",
        banereglement: "",
        latitude: "",
        longitude: "",
        feedUrl: "",
        feedSynligAntallDager: "",
    });

    const [touched, setTouched] = useState<TouchedState>({
        navn: false,
        kontaktEpost: false,
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

        // Reset touched når vi laster inn fra server (slik at vi ikke viser feil med en gang)
        setTouched({ navn: false, kontaktEpost: false });
    }, [klubb]);

    const errors = useMemo(() => {
        return {
            navn: validateKlubbnavn(form.navn),
            kontaktEpost: validateKontaktEpost(form.kontaktEpost),
        };
    }, [form.navn, form.kontaktEpost]);

    const isDirty = useMemo(() => {
        if (!klubb) return false;

        return (
            (form.navn ?? "") !== (klubb.navn ?? "") ||
            (form.kontaktEpost ?? "") !== (klubb.kontaktEpost ?? "") ||
            (form.banereglement ?? "") !== (klubb.banereglement ?? "") ||
            (form.latitude ?? "") !== (klubb.latitude?.toString() ?? "") ||
            (form.longitude ?? "") !== (klubb.longitude?.toString() ?? "") ||
            (form.feedUrl ?? "") !== (klubb.feedUrl ?? "") ||
            (form.feedSynligAntallDager ?? "") !==
            (klubb.feedSynligAntallDager ?? 50).toString()
        );
    }, [klubb, form]);

    const isValid = useMemo(() => {
        return !errors.navn && !errors.kontaktEpost;
    }, [errors]);

    const canSubmit = isDirty && isValid;

    if (isLoading || !klubb) return <LoaderSkeleton />;

    const onChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((f) => ({ ...f, [key]: value }));
    };

    function touchField(key: keyof TouchedState) {
        setTouched((t) => (t[key] ? t : { ...t, [key]: true }));
    }

    function touchMany(keys: (keyof TouchedState)[]) {
        setTouched((t) => {
            let changed = false;
            const next = { ...t };
            for (const k of keys) {
                if (!next[k]) {
                    next[k] = true;
                    changed = true;
                }
            }
            return changed ? next : t;
        });
    }

    const onSubmit = () => {
        // Vis valideringsfeil hvis de finnes
        touchMany(["navn", "kontaktEpost"]);

        if (!isValid) return;

        const lat = parseOptionalNumber(form.latitude);
        const lon = parseOptionalNumber(form.longitude);
        const feedDays = parseOptionalNumber(form.feedSynligAntallDager);

        OppdaterKlubbForespørsel.mutate({
            ...klubb,
            navn: form.navn.trim(),
            kontaktEpost: form.kontaktEpost.trim(),
            banereglement: form.banereglement,

            latitude: lat ?? klubb.latitude ?? null,
            longitude: lon ?? klubb.longitude ?? null,

            feedUrl: form.feedUrl,
            feedSynligAntallDager: feedDays ?? klubb.feedSynligAntallDager ?? 50,
        });
    };

    return (
        <KlubbInnstillingerContent
            form={form}
            onChange={onChange}
            // canSubmit betyr nå: dirty + valid
            canSubmit={canSubmit}
            isSaving={OppdaterKlubbForespørsel.isPending}
            onSubmit={onSubmit}
            // NYTT:
            touched={touched}
            errors={errors}
            onBlurField={touchField}
        />
    );
}
