import { useEffect, useMemo, useState } from "react";
import { useBaner } from "@/hooks/useBaner";

import LoaderSkeleton from "@/components/LoaderSkeleton";
import RedigerBaneContent from "./RedigerBaneContent";
import { loadValgtBaneId, saveValgtBaneId } from "./storage";

type Bane = {
    id: string;
    navn: string;
    beskrivelse: string;
    aktiv: boolean;
};

type BaneFormData = {
    navn: string;
    beskrivelse: string;
    aktiv: boolean;
};

type TouchedState = { navn: boolean };

function validateNavn(navn: string): string | null {
    const v = navn.trim();
    if (!v) return "Navn er påkrevd.";
    return null;
}

export default function RedigerBaneView() {
    const { baner, isLoading, oppdaterBane } = useBaner(true);

    const [redigerte, setRedigerte] = useState<Record<string, BaneFormData>>({});
    const [valgtBaneId, setValgtBaneId] = useState<string | null>(() => loadValgtBaneId());

    // touched per bane-id (så du ikke får “feil” på ny bane du klikker deg inn på)
    const [touched, setTouched] = useState<Record<string, TouchedState>>({});
    const [submitAttempted, setSubmitAttempted] = useState(false);

    const valgtBane: Bane | null = useMemo(
        () => baner.find((b) => b.id === valgtBaneId) ?? null,
        [baner, valgtBaneId]
    );

    const redigerteVerdier: BaneFormData | null = useMemo(() => {
        if (!valgtBaneId) return null;
        return redigerte[valgtBaneId] ?? null;
    }, [redigerte, valgtBaneId]);

    // Persist valgt bane-id
    useEffect(() => {
        saveValgtBaneId(valgtBaneId);
    }, [valgtBaneId]);

    // Hvis valgt bane ikke finnes lenger, nullstill
    useEffect(() => {
        if (valgtBaneId && !baner.some((b) => b.id === valgtBaneId)) {
            setValgtBaneId(null);
        }
    }, [baner, valgtBaneId]);

    // Default til første bane om ingen er valgt
    useEffect(() => {
        if (!valgtBaneId && baner.length > 0) {
            setValgtBaneId(baner[0].id);
        }
    }, [baner, valgtBaneId]);

    // Når du bytter bane, er det ofte mest “rolig” å resette submitAttempted
    // (slik at feil ikke vises før blur/submit igjen)
    useEffect(() => {
        setSubmitAttempted(false);
    }, [valgtBaneId]);

    function touchField(baneId: string, key: keyof TouchedState) {
        setTouched((prev) => {
            const current = prev[baneId] ?? { navn: false };
            if (current[key]) return prev;
            return { ...prev, [baneId]: { ...current, [key]: true } };
        });
    }

    function håndterEndring(id: string, felt: keyof BaneFormData, verdi: string | boolean) {
        setRedigerte((prev) => ({
            ...prev,
            [id]: {
                ...(prev[id] ?? (baner.find((b) => b.id === id) as BaneFormData)),
                [felt]: verdi,
            },
        }));
    }

    // Bygg "draft" vi faktisk viser i UI (draft > valgtBane)
    const draft: BaneFormData | null = useMemo(() => {
        if (!valgtBane) return null;
        return redigerteVerdier ?? {
            navn: valgtBane.navn,
            beskrivelse: valgtBane.beskrivelse,
            aktiv: valgtBane.aktiv,
        };
    }, [valgtBane, redigerteVerdier]);

    const errors = useMemo(() => {
        return {
            navn: draft ? validateNavn(draft.navn) : null,
        };
    }, [draft]);

    const isDirty = useMemo(() => {
        if (!valgtBane || !redigerteVerdier) return false;

        return !(
            redigerteVerdier.navn === valgtBane.navn &&
            redigerteVerdier.beskrivelse === valgtBane.beskrivelse &&
            redigerteVerdier.aktiv === valgtBane.aktiv
        );
    }, [valgtBane, redigerteVerdier]);

    const isValid = useMemo(() => !errors.navn, [errors.navn]);

    // samme semantikk som klubb: dirty + valid
    const canSubmit = isDirty && isValid;

    const touchedNavn =
        valgtBaneId ? (touched[valgtBaneId]?.navn ?? false) : false;

    // samme logikk som dere bruker ellers: vis feil ved blur eller submit attempt
    const navnError = (touchedNavn || submitAttempted) ? errors.navn : null;

    async function onSubmit() {
        if (!valgtBaneId || !valgtBane) return;

        setSubmitAttempted(true);
        touchField(valgtBaneId, "navn");

        if (!canSubmit) return;

        const dto = redigerte[valgtBaneId];
        if (!dto) return;

        try {
            await oppdaterBane.mutateAsync({ id: valgtBaneId, dto });

            // Etter lagring: fjern draft for valgt bane
            setRedigerte((prev) => {
                const ny = { ...prev };
                delete ny[valgtBaneId];
                return ny;
            });

            // Optional: reset touched for denne banen etter lagring
            setTouched((prev) => {
                const ny = { ...prev };
                delete ny[valgtBaneId];
                return ny;
            });

            setSubmitAttempted(false);
        } catch {
            // Feil håndteres i hook (toast)
        }
    }

    if (isLoading) return <LoaderSkeleton />;

    return (
        <RedigerBaneContent
            baner={baner}
            valgtBaneId={valgtBaneId}
            onChangeValgtBaneId={setValgtBaneId}
            valgtBane={valgtBane}
            redigerteVerdier={redigerteVerdier}
            onChangeFelt={(felt, verdi) => {
                if (!valgtBane) return;
                håndterEndring(valgtBane.id, felt, verdi);
            }}
            canSubmit={canSubmit}
            isSaving={oppdaterBane.isPending}
            onSubmit={() => void onSubmit()}
            navnError={navnError}
            onBlurNavn={() => {
                if (!valgtBaneId) return;
                touchField(valgtBaneId, "navn");
            }}
        />
    );
}
