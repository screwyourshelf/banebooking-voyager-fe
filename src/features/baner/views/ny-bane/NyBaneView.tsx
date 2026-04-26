import { useMemo, useState } from "react";
import { useBaner } from "@/hooks/useBaner";
import { useGrener } from "@/hooks/useGrener";

import NyBaneContent from "./NyBaneContent";

type FormState = {
  navn: string;
  beskrivelse: string;
  sortering: string;
  grenId: string;
};

function validateNavn(navn: string): string | null {
  const v = navn.trim();
  if (!v) return "Navn er påkrevd.";
  return null;
}

export default function NyBaneView() {
  const { opprettBane } = useBaner();
  const { grener } = useGrener(false);

  const [form, setForm] = useState<FormState>({
    navn: "",
    beskrivelse: "",
    sortering: "0",
    grenId: "",
  });
  const [touched, setTouched] = useState<{ navn: boolean }>({ navn: false });
  const errors = useMemo(() => ({ navn: validateNavn(form.navn) }), [form.navn]);

  const effectiveGrenId = form.grenId || grener[0]?.id || "";

  const isDirty = useMemo(
    () => form.navn.trim().length > 0 || form.beskrivelse.trim().length > 0,
    [form.navn, form.beskrivelse]
  );

  const isValid = useMemo(() => !errors.navn && !!effectiveGrenId, [errors.navn, effectiveGrenId]);

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
    const sortering = parseInt(form.sortering, 10);

    try {
      await opprettBane.mutateAsync({
        navn,
        beskrivelse: form.beskrivelse,
        sortering: Number.isFinite(sortering) ? sortering : 0,
        grenId: effectiveGrenId,
      });

      setForm({
        navn: "",
        beskrivelse: "",
        sortering: "0",
        grenId: grener.length === 1 ? grener[0].id : "",
      });
      setTouched({ navn: false });
    } catch {
      // feil vises inline via opprettBane.error
    }
  }

  return (
    <NyBaneContent
      form={{ ...form, grenId: effectiveGrenId }}
      onChange={onChange}
      grener={grener}
      canSubmit={canSubmit}
      isSaving={opprettBane.isPending}
      onSubmit={() => void onSubmit()}
      navnError={navnError}
      onBlurNavn={touchNavn}
      mutasjonFeil={opprettBane.error?.message ?? null}
    />
  );
}
