import { useEffect, useMemo, useState } from "react";
import { useGrener } from "@/hooks/useGrener";

import { FormSkeleton } from "@/components/loading";
import { QueryFeil } from "@/components/errors";
import RedigerGrenContent from "./RedigerGrenContent";
import { loadValgtGrenId, saveValgtGrenId } from "./storage";
import type { GrenRespons } from "@/types";

type GrenFormData = {
  navn: string;
  banereglement: string;
  aktiv: boolean;
  sortering: string;
  aapningstid: number;
  stengetid: number;
  maksPerDag: number;
  maksTotalt: number;
  dagerFremITid: number;
  slotLengdeMinutter: number;
};

type TouchedState = { navn: boolean };

function validateNavn(navn: string): string | null {
  const v = navn.trim();
  if (!v) return "Navn er påkrevd.";
  return null;
}

function timeToHour(t: string): number {
  const h = parseInt((t ?? "").split(":")[0] ?? "0", 10);
  return Number.isFinite(h) ? h : 0;
}

function hourToTime(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

function tilFormData(gren: GrenRespons): GrenFormData {
  return {
    navn: gren.navn,
    banereglement: gren.banereglement,
    aktiv: gren.aktiv,
    sortering: String(gren.sortering),
    aapningstid: timeToHour(gren.bookingInnstillinger.aapningstid),
    stengetid: timeToHour(gren.bookingInnstillinger.stengetid),
    maksPerDag: gren.bookingInnstillinger.maksPerDag,
    maksTotalt: gren.bookingInnstillinger.maksTotalt,
    dagerFremITid: gren.bookingInnstillinger.dagerFremITid,
    slotLengdeMinutter: gren.bookingInnstillinger.slotLengdeMinutter,
  };
}

export default function RedigerGrenView() {
  const { grener, isLoading, isFetching, error, refetch, oppdaterGren } = useGrener(true);

  const [redigerte, setRedigerte] = useState<Record<string, GrenFormData>>({});
  const [valgtGrenId, setValgtGrenId] = useState<string | null>(() => loadValgtGrenId());

  const [touched, setTouched] = useState<Record<string, TouchedState>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const valgtGren: GrenRespons | null = useMemo(
    () => grener.find((g) => g.id === valgtGrenId) ?? null,
    [grener, valgtGrenId]
  );

  const redigerteVerdier: GrenFormData | null = useMemo(() => {
    if (!valgtGrenId) return null;
    return redigerte[valgtGrenId] ?? null;
  }, [redigerte, valgtGrenId]);

  useEffect(() => {
    saveValgtGrenId(valgtGrenId);
  }, [valgtGrenId]);

  useEffect(() => {
    if (valgtGrenId && !grener.some((g) => g.id === valgtGrenId)) {
      setValgtGrenId(null);
    }
  }, [grener, valgtGrenId]);

  useEffect(() => {
    if (!valgtGrenId && grener.length > 0) {
      setValgtGrenId(grener[0].id);
    }
  }, [grener, valgtGrenId]);

  useEffect(() => {
    setSubmitAttempted(false);
  }, [valgtGrenId]);

  function touchField(grenId: string, key: keyof TouchedState) {
    setTouched((prev) => {
      const current = prev[grenId] ?? { navn: false };
      if (current[key]) return prev;
      return { ...prev, [grenId]: { ...current, [key]: true } };
    });
  }

  function håndterEndring(id: string, felt: keyof GrenFormData, verdi: string | boolean | number) {
    setRedigerte((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ??
          (grener.find((g) => g.id === id)
            ? tilFormData(grener.find((g) => g.id === id)!)
            : undefined)),
        [felt]: verdi,
      },
    }));
  }

  const draft: GrenFormData | null = useMemo(() => {
    if (!valgtGren) return null;
    return redigerteVerdier ?? tilFormData(valgtGren);
  }, [valgtGren, redigerteVerdier]);

  const errors = useMemo(() => {
    return { navn: draft ? validateNavn(draft.navn) : null };
  }, [draft]);

  const isValid = useMemo(() => !errors.navn, [errors.navn]);

  const touchedNavn = valgtGrenId ? (touched[valgtGrenId]?.navn ?? false) : false;
  const navnError = touchedNavn || submitAttempted ? errors.navn : null;

  // --- Dirty / canSubmit ---

  const isDirty = useMemo(() => {
    if (!valgtGren || !draft) return false;
    return !(
      draft.navn === valgtGren.navn &&
      draft.banereglement === valgtGren.banereglement &&
      draft.aktiv === valgtGren.aktiv &&
      draft.sortering === String(valgtGren.sortering) &&
      draft.aapningstid === timeToHour(valgtGren.bookingInnstillinger.aapningstid) &&
      draft.stengetid === timeToHour(valgtGren.bookingInnstillinger.stengetid) &&
      draft.maksPerDag === valgtGren.bookingInnstillinger.maksPerDag &&
      draft.maksTotalt === valgtGren.bookingInnstillinger.maksTotalt &&
      draft.dagerFremITid === valgtGren.bookingInnstillinger.dagerFremITid &&
      draft.slotLengdeMinutter === valgtGren.bookingInnstillinger.slotLengdeMinutter
    );
  }, [valgtGren, draft]);

  const canSubmit = isDirty && isValid;
  const isSaving = oppdaterGren.isPending;

  // --- Submit ---

  async function onSubmit() {
    if (!valgtGrenId || !valgtGren || !draft) return;

    setSubmitAttempted(true);
    touchField(valgtGrenId, "navn");
    if (!isValid) return;
    if (!isDirty) return;

    const sortering = parseInt(draft.sortering, 10);

    try {
      await oppdaterGren.mutateAsync({
        id: valgtGrenId,
        dto: {
          navn: draft.navn.trim(),
          banereglement: draft.banereglement,
          sortering: Number.isFinite(sortering) ? sortering : 0,
          aktiv: draft.aktiv,
          aapningstid: hourToTime(draft.aapningstid),
          stengetid: hourToTime(draft.stengetid),
          maksPerDag: draft.maksPerDag,
          maksTotalt: draft.maksTotalt,
          dagerFremITid: draft.dagerFremITid,
          slotLengdeMinutter: draft.slotLengdeMinutter,
        },
      });

      setRedigerte((prev) => {
        const ny = { ...prev };
        delete ny[valgtGrenId];
        return ny;
      });
      setTouched((prev) => {
        const ny = { ...prev };
        delete ny[valgtGrenId];
        return ny;
      });
      setSubmitAttempted(false);
    } catch {
      // feil vises inline via oppdaterGren.error
    }
  }

  if (isLoading) return <FormSkeleton />;

  return (
    <QueryFeil error={error} isFetching={isFetching} onRetry={() => void refetch()}>
      <RedigerGrenContent
        grener={grener}
        valgtGrenId={valgtGrenId}
        onChangeValgtGrenId={setValgtGrenId}
        valgtGren={valgtGren}
        redigerteVerdier={redigerteVerdier}
        onChangeFelt={(felt, verdi) => {
          if (!valgtGren) return;
          håndterEndring(valgtGren.id, felt, verdi);
        }}
        navnError={navnError}
        onBlurNavn={() => {
          if (!valgtGrenId) return;
          touchField(valgtGrenId, "navn");
        }}
        canSubmit={canSubmit}
        isSaving={isSaving}
        onSubmit={() => void onSubmit()}
        mutasjonFeil={oppdaterGren.error?.message ?? null}
      />
    </QueryFeil>
  );
}
