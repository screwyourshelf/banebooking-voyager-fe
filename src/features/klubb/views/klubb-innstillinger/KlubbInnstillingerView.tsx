import { useEffect, useMemo, useState } from "react";
import { FormSkeleton } from "@/components/loading";
import { QueryFeil } from "@/components/errors";
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
  feedSynligAntallDager: boolean;
};

const MAX_KLUBBNAVN = 60;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateKlubbnavn(navn: string): string | null {
  const v = navn.trim();
  if (!v) return "Klubbnavn kan ikke være tomt.";
  if (v.length < 2) return "Klubbnavn må være minst 2 tegn.";
  if (v.length > MAX_KLUBBNAVN) return `Klubbnavn kan ikke være lengre enn ${MAX_KLUBBNAVN} tegn.`;
  return null;
}

function validateKontaktEpost(epost: string): string | null {
  const v = epost.trim();
  if (!v) return "Kontakt-e-post kan ikke være tom.";
  if (!EMAIL_REGEX.test(v)) return "Skriv inn en gyldig e-postadresse.";
  return null;
}

function validateFeedSynligAntallDager(value: string): string | null {
  const t = value.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isInteger(n) || n < 1 || n > 150) return "Antall dager må være mellom 1 og 150.";
  return null;
}

function parseOptionalNumber(text: string): number | undefined {
  const t = text.trim();
  if (!t) return undefined;
  const n = Number(t.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

export default function KlubbInnstillingerView() {
  const {
    data: klubb,
    isLoading,
    error,
    refetch,
    oppdaterKlubb,
    oppdaterKlubbLaster,
    oppdaterKlubbFeil,
  } = useKlubb();

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
    feedSynligAntallDager: false,
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
    setTouched({ navn: false, kontaktEpost: false, feedSynligAntallDager: false });
  }, [klubb]);

  const errors = useMemo(() => {
    return {
      navn: validateKlubbnavn(form.navn),
      kontaktEpost: validateKontaktEpost(form.kontaktEpost),
      feedSynligAntallDager: validateFeedSynligAntallDager(form.feedSynligAntallDager),
    };
  }, [form.navn, form.kontaktEpost, form.feedSynligAntallDager]);

  const isDirty = useMemo(() => {
    if (!klubb) return false;

    return (
      (form.navn ?? "") !== (klubb.navn ?? "") ||
      (form.kontaktEpost ?? "") !== (klubb.kontaktEpost ?? "") ||
      (form.banereglement ?? "") !== (klubb.banereglement ?? "") ||
      (form.latitude ?? "") !== (klubb.latitude?.toString() ?? "") ||
      (form.longitude ?? "") !== (klubb.longitude?.toString() ?? "") ||
      (form.feedUrl ?? "") !== (klubb.feedUrl ?? "") ||
      (form.feedSynligAntallDager ?? "") !== (klubb.feedSynligAntallDager ?? 50).toString()
    );
  }, [klubb, form]);

  const isValid = useMemo(() => {
    return !errors.navn && !errors.kontaktEpost && !errors.feedSynligAntallDager;
  }, [errors]);

  const canSubmit = isDirty && isValid;

  if (isLoading) return <FormSkeleton />;
  if (!klubb)
    return (
      <QueryFeil error={error} isFetching={false} onRetry={refetch}>
        {null}
      </QueryFeil>
    );

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
    touchMany(["navn", "kontaktEpost", "feedSynligAntallDager"]);

    if (!isValid) return;

    const lat = parseOptionalNumber(form.latitude);
    const lon = parseOptionalNumber(form.longitude);
    const feedDays = parseOptionalNumber(form.feedSynligAntallDager);

    void oppdaterKlubb({
      ...klubb,
      navn: form.navn.trim(),
      kontaktEpost: form.kontaktEpost.trim(),
      banereglement: form.banereglement,

      latitude: lat ?? klubb.latitude ?? undefined,
      longitude: lon ?? klubb.longitude ?? undefined,

      feedUrl: form.feedUrl,
      feedSynligAntallDager: feedDays ?? klubb.feedSynligAntallDager ?? 50,
    });
  };

  return (
    <KlubbInnstillingerContent
      form={form}
      onChange={onChange}
      canSubmit={canSubmit}
      isSaving={oppdaterKlubbLaster}
      onSubmit={onSubmit}
      touched={touched}
      errors={errors}
      onBlurField={touchField}
      mutasjonFeil={oppdaterKlubbFeil?.message ?? null}
    />
  );
}
