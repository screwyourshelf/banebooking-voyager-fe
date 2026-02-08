import { useMemo, useState } from "react";
import { useBaner } from "@/hooks/useBaner";

import NyBaneContent from "./NyBaneContent";

type FormState = {
  navn: string;
  beskrivelse: string;
};

function validateNavn(navn: string): string | null {
  const v = navn.trim();
  if (!v) return "Navn er påkrevd.";
  return null;
}

export default function NyBaneView() {
  const { opprettBane } = useBaner();

  const [form, setForm] = useState<FormState>({ navn: "", beskrivelse: "" });
  const [touched, setTouched] = useState<{ navn: boolean }>({ navn: false });
  const errors = useMemo(() => ({ navn: validateNavn(form.navn) }), [form.navn]);

  const isDirty = useMemo(
    () => form.navn.trim().length > 0 || form.beskrivelse.trim().length > 0,
    [form.navn, form.beskrivelse]
  );

  const isValid = useMemo(() => !errors.navn, [errors.navn]);

  const canSubmit = isDirty && isValid;

  const navnError = touched.navn ? errors.navn : null;

  function onChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function touchNavn() {
    setTouched((t) => (t.navn ? t : { ...t, navn: true }));
  }

  async function onSubmit() {
    touchNavn();
    if (!isValid) return;

    const navn = form.navn.trim();

    try {
      await opprettBane.mutateAsync({ navn, beskrivelse: form.beskrivelse });

      setForm({ navn: "", beskrivelse: "" });
      setTouched({ navn: false });
    } catch {
      // Backend-feil håndteres i hook (toast)
    }
  }

  return (
    <NyBaneContent
      form={form}
      onChange={onChange}
      canSubmit={canSubmit}
      isSaving={opprettBane.isPending}
      onSubmit={() => void onSubmit()}
      navnError={navnError}
      onBlurNavn={touchNavn}
    />
  );
}
