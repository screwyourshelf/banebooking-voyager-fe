import { useMemo, useState } from "react";
import { useGrener } from "@/hooks/useGrener";

import NyGrenContent from "./NyGrenContent";

type FormState = {
  navn: string;
  banereglement: string;
  sortering: string;
  aapningstid: number;
  stengetid: number;
  maksPerDag: number;
  maksTotalt: number;
  dagerFremITid: number;
  slotLengdeMinutter: number;
};

const defaultForm: FormState = {
  navn: "",
  banereglement: "",
  sortering: "0",
  aapningstid: 7,
  stengetid: 22,
  maksPerDag: 2,
  maksTotalt: 5,
  dagerFremITid: 7,
  slotLengdeMinutter: 60,
};

function validateNavn(navn: string): string | null {
  const v = navn.trim();
  if (!v) return "Navn er påkrevd.";
  return null;
}

function hourToTime(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

export default function NyGrenView() {
  const { opprettGren } = useGrener();

  const [form, setForm] = useState<FormState>({ ...defaultForm });
  const [touched, setTouched] = useState<{ navn: boolean }>({ navn: false });
  const errors = useMemo(() => ({ navn: validateNavn(form.navn) }), [form.navn]);

  const isDirty = useMemo(() => form.navn.trim().length > 0, [form.navn]);
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

    const sortering = parseInt(form.sortering, 10);

    try {
      await opprettGren.mutateAsync({
        navn: form.navn.trim(),
        banereglement: form.banereglement,
        sortering: Number.isFinite(sortering) ? sortering : 0,
        aapningstid: hourToTime(form.aapningstid),
        stengetid: hourToTime(form.stengetid),
        maksPerDag: form.maksPerDag,
        maksTotalt: form.maksTotalt,
        dagerFremITid: form.dagerFremITid,
        slotLengdeMinutter: form.slotLengdeMinutter,
      });

      setForm({ ...defaultForm });
      setTouched({ navn: false });
    } catch {
      // feil vises inline via opprettGren.error
    }
  }

  return (
    <NyGrenContent
      form={form}
      onChange={onChange}
      canSubmit={canSubmit}
      isSaving={opprettGren.isPending}
      onSubmit={() => void onSubmit()}
      navnError={navnError}
      onBlurNavn={touchNavn}
      mutasjonFeil={opprettGren.error?.message ?? null}
    />
  );
}
