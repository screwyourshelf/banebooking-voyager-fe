import { useEffect, useMemo, useState } from "react";
import { useBaner } from "@/hooks/useBaner";
import { useKlubb } from "@/hooks/useKlubb";

import { FormSkeleton } from "@/components/loading";
import { QueryFeil } from "@/components/errors";
import RedigerBaneContent from "./RedigerBaneContent";
import { loadValgtBaneId, saveValgtBaneId } from "./storage";
import type { BaneRespons, OppdaterBaneBookingInnstillingerForespørsel } from "@/types";

type BaneFormData = {
  navn: string;
  beskrivelse: string;
  aktiv: boolean;
  sortering: string;
};

type OverstyringFormData = {
  aapningstid: number | null;
  stengetid: number | null;
  slotLengdeMinutter: number | null;
  maksPerDag: number | null;
  maksTotalt: number | null;
  dagerFremITid: number | null;
};

const ALLE_NULL: OverstyringFormData = {
  aapningstid: null,
  stengetid: null,
  slotLengdeMinutter: null,
  maksPerDag: null,
  maksTotalt: null,
  dagerFremITid: null,
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

function tilFormData(bane: BaneRespons): BaneFormData {
  return {
    navn: bane.navn,
    beskrivelse: bane.beskrivelse,
    aktiv: bane.aktiv,
    sortering: String(bane.sortering),
  };
}

export default function RedigerBaneView() {
  const { baner, isLoading, isFetching, error, refetch, oppdaterBane, oppdaterBookingInnstillinger } = useBaner(true);
  const { data: klubb, isLoading: loadingKlubb } = useKlubb();

  const [redigerte, setRedigerte] = useState<Record<string, BaneFormData>>({});
  const [valgtBaneId, setValgtBaneId] = useState<string | null>(() => loadValgtBaneId());

  const [touched, setTouched] = useState<Record<string, TouchedState>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const valgtBane: BaneRespons | null = useMemo(
    () => baner.find((b) => b.id === valgtBaneId) ?? null,
    [baner, valgtBaneId]
  );

  const redigerteVerdier: BaneFormData | null = useMemo(() => {
    if (!valgtBaneId) return null;
    return redigerte[valgtBaneId] ?? null;
  }, [redigerte, valgtBaneId]);

  useEffect(() => {
    saveValgtBaneId(valgtBaneId);
  }, [valgtBaneId]);

  useEffect(() => {
    if (valgtBaneId && !baner.some((b) => b.id === valgtBaneId)) {
      setValgtBaneId(null);
    }
  }, [baner, valgtBaneId]);

  useEffect(() => {
    if (!valgtBaneId && baner.length > 0) {
      setValgtBaneId(baner[0].id);
    }
  }, [baner, valgtBaneId]);

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
        ...(prev[id] ??
          (baner.find((b) => b.id === id)
            ? tilFormData(baner.find((b) => b.id === id)!)
            : undefined)),
        [felt]: verdi,
      },
    }));
  }

  const draft: BaneFormData | null = useMemo(() => {
    if (!valgtBane) return null;
    return redigerteVerdier ?? (valgtBane ? tilFormData(valgtBane) : null);
  }, [valgtBane, redigerteVerdier]);

  const errors = useMemo(() => {
    return { navn: draft ? validateNavn(draft.navn) : null };
  }, [draft]);

  const isValid = useMemo(() => !errors.navn, [errors.navn]);

  const touchedNavn = valgtBaneId ? (touched[valgtBaneId]?.navn ?? false) : false;
  const navnError = touchedNavn || submitAttempted ? errors.navn : null;

  // --- Booking-overstyring ---

  const [overstyringDrafts, setOverstyringDrafts] = useState<Record<string, OverstyringFormData>>(
    {}
  );

  const [overstyringAktivDraft, setOverstyringAktivDraft] = useState<Record<string, boolean>>({});

  const serverOverstyring: OverstyringFormData | null = useMemo(() => {
    if (!valgtBane) return null;
    const o = valgtBane.bookingOverstyring;
    if (!o) return { ...ALLE_NULL };
    return {
      aapningstid: o.aapningstid !== null ? timeToHour(o.aapningstid) : null,
      stengetid: o.stengetid !== null ? timeToHour(o.stengetid) : null,
      slotLengdeMinutter: o.slotLengdeMinutter,
      maksPerDag: o.maksPerDag,
      maksTotalt: o.maksTotalt,
      dagerFremITid: o.dagerFremITid,
    };
  }, [valgtBane]);

  const serverHarOverstyring = useMemo(() => {
    if (!valgtBane) return false;
    return valgtBane.harOverstyring;
  }, [valgtBane]);

  const overstyringAktivert = useMemo(() => {
    if (!valgtBaneId) return false;
    return overstyringAktivDraft[valgtBaneId] ?? serverHarOverstyring;
  }, [valgtBaneId, overstyringAktivDraft, serverHarOverstyring]);

  const overstyring: OverstyringFormData | null = useMemo(() => {
    if (!valgtBaneId || !serverOverstyring) return null;
    return overstyringDrafts[valgtBaneId] ?? serverOverstyring;
  }, [valgtBaneId, overstyringDrafts, serverOverstyring]);

  useEffect(() => {
    if (!valgtBaneId) return;
    setOverstyringDrafts((prev) => {
      if (!prev[valgtBaneId]) return prev;
      const ny = { ...prev };
      delete ny[valgtBaneId];
      return ny;
    });
    setOverstyringAktivDraft((prev) => {
      if (!(valgtBaneId in prev)) return prev;
      const ny = { ...prev };
      delete ny[valgtBaneId];
      return ny;
    });
  }, [valgtBaneId]);

  const klubbDefault = klubb?.bookingRegel ?? null;

  function handleToggleOverstyringAktivert(aktiv: boolean) {
    if (!valgtBaneId) return;
    setOverstyringAktivDraft((prev) => ({ ...prev, [valgtBaneId]: aktiv }));
    if (!aktiv) {
      setOverstyringDrafts((prev) => ({
        ...prev,
        [valgtBaneId]: { ...ALLE_NULL },
      }));
    }
  }

  function handleToggleOverstyring(felt: keyof OverstyringFormData, aktiv: boolean) {
    if (!valgtBaneId || !klubbDefault) return;
    const current = overstyring ?? serverOverstyring;
    if (!current) return;

    const defaultVerdier: Record<keyof OverstyringFormData, number> = {
      aapningstid: timeToHour(klubbDefault.aapningstid),
      stengetid: timeToHour(klubbDefault.stengetid),
      slotLengdeMinutter: klubbDefault.slotLengdeMinutter,
      maksPerDag: klubbDefault.maksPerDag,
      maksTotalt: klubbDefault.maksTotalt,
      dagerFremITid: klubbDefault.dagerFremITid,
    };

    setOverstyringDrafts((prev) => ({
      ...prev,
      [valgtBaneId]: {
        ...current,
        [felt]: aktiv ? defaultVerdier[felt] : null,
      },
    }));
  }

  function handleChangeOverstyring(felt: keyof OverstyringFormData, verdi: number) {
    if (!valgtBaneId) return;
    const current = overstyring ?? serverOverstyring;
    if (!current) return;

    setOverstyringDrafts((prev) => ({
      ...prev,
      [valgtBaneId]: { ...current, [felt]: verdi },
    }));
  }

  // --- Dirty / canSubmit ---

  const baneDirty = useMemo(() => {
    if (!valgtBane || !redigerteVerdier) return false;
    return !(
      redigerteVerdier.navn === valgtBane.navn &&
      redigerteVerdier.beskrivelse === valgtBane.beskrivelse &&
      redigerteVerdier.aktiv === valgtBane.aktiv &&
      redigerteVerdier.sortering === String(valgtBane.sortering)
    );
  }, [valgtBane, redigerteVerdier]);

  const overstyringDirty = useMemo(() => {
    if (!valgtBaneId || !serverOverstyring) return false;

    if (overstyringAktivert !== serverHarOverstyring) return true;

    const draft = overstyringDrafts[valgtBaneId];
    if (!draft) return false;
    return (
      draft.aapningstid !== serverOverstyring.aapningstid ||
      draft.stengetid !== serverOverstyring.stengetid ||
      draft.slotLengdeMinutter !== serverOverstyring.slotLengdeMinutter ||
      draft.maksPerDag !== serverOverstyring.maksPerDag ||
      draft.maksTotalt !== serverOverstyring.maksTotalt ||
      draft.dagerFremITid !== serverOverstyring.dagerFremITid
    );
  }, [
    valgtBaneId,
    overstyringDrafts,
    serverOverstyring,
    overstyringAktivert,
    serverHarOverstyring,
  ]);

  const isDirty = baneDirty || overstyringDirty;
  const canSubmit = isDirty && isValid;
  const isSaving = oppdaterBane.isPending || oppdaterBookingInnstillinger.isPending;

  // --- Submit ---

  async function onSubmit() {
    if (!valgtBaneId || !valgtBane) return;

    setSubmitAttempted(true);
    touchField(valgtBaneId, "navn");
    if (!isValid) return;
    if (!isDirty) return;

    try {
      if (baneDirty) {
        const dto = redigerte[valgtBaneId];
        if (dto) {
          const sortering = parseInt(dto.sortering, 10);
          await oppdaterBane.mutateAsync({
            id: valgtBaneId,
            dto: {
              navn: dto.navn,
              beskrivelse: dto.beskrivelse,
              aktiv: dto.aktiv,
              sortering: Number.isFinite(sortering) ? sortering : 0,
            },
          });
        }
      }

      if (overstyringDirty) {
        const effektiv = overstyringAktivert ? (overstyring ?? ALLE_NULL) : ALLE_NULL;

        const dto: OppdaterBaneBookingInnstillingerForespørsel = {
          aapningstid: effektiv.aapningstid !== null ? hourToTime(effektiv.aapningstid) : null,
          stengetid: effektiv.stengetid !== null ? hourToTime(effektiv.stengetid) : null,
          slotLengdeMinutter: effektiv.slotLengdeMinutter,
          maksPerDag: effektiv.maksPerDag,
          maksTotalt: effektiv.maksTotalt,
          dagerFremITid: effektiv.dagerFremITid,
        };

        await oppdaterBookingInnstillinger.mutateAsync({ id: valgtBaneId, dto });
      }

      setRedigerte((prev) => {
        const ny = { ...prev };
        delete ny[valgtBaneId];
        return ny;
      });
      setTouched((prev) => {
        const ny = { ...prev };
        delete ny[valgtBaneId];
        return ny;
      });
      setOverstyringDrafts((prev) => {
        const ny = { ...prev };
        delete ny[valgtBaneId];
        return ny;
      });
      setOverstyringAktivDraft((prev) => {
        const ny = { ...prev };
        delete ny[valgtBaneId];
        return ny;
      });
      setSubmitAttempted(false);
    } catch {
      // Feil håndteres i hooks (toast)
    }
  }

  if (isLoading || loadingKlubb) return <FormSkeleton />;

  return (
    <QueryFeil error={error} isFetching={isFetching} onRetry={() => void refetch()}>
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
      navnError={navnError}
      onBlurNavn={() => {
        if (!valgtBaneId) return;
        touchField(valgtBaneId, "navn");
      }}
      overstyringAktivert={overstyringAktivert}
      onToggleOverstyringAktivert={handleToggleOverstyringAktivert}
      klubbDefault={klubbDefault}
      overstyring={overstyring}
      onToggleOverstyring={handleToggleOverstyring}
      onChangeOverstyring={handleChangeOverstyring}
      canSubmit={canSubmit}
      isSaving={isSaving}
      onSubmit={() => void onSubmit()}
    />
    </QueryFeil>
  );
}
