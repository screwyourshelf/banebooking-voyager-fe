import { useMemo, useState } from "react";
import { useGrener } from "@/hooks/useGrener";
import GrenEditorContent, { type GrenFormData } from "@/features/grener/GrenEditorContent";

type Props = {
  onCreated: () => void;
};

const defaultForm: GrenFormData = {
  navn: "",
  banereglement: "",
  aktiv: true,
  sortering: "0",
  aapningstid: 7,
  stengetid: 22,
  maksPerDag: 2,
  maksTotalt: 5,
  dagerFremITid: 7,
  slotLengdeMinutter: 60,
};

function validateNavn(navn: string): string | null {
  return navn.trim() ? null : "Navn er påkrevd.";
}

function hourToTime(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export default function NyGrenView({ onCreated }: Props) {
  const { opprettGren } = useGrener();
  const [form, setForm] = useState<GrenFormData>({ ...defaultForm });
  const [touched, setTouched] = useState(false);
  const navnError = validateNavn(form.navn);
  const isDirty = useMemo(() => form.navn.trim().length > 0, [form.navn]);
  const canSubmit = isDirty && !navnError;

  function onChange<K extends keyof GrenFormData>(key: K, value: GrenFormData[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit() {
    setTouched(true);
    if (navnError) return;

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
      setTouched(false);
      onCreated();
    } catch {
      // Feilen vises i skjemaet.
    }
  }

  return (
    <GrenEditorContent
      form={form}
      onChange={onChange}
      showActive={false}
      canSubmit={canSubmit}
      isSaving={opprettGren.isPending}
      onSubmit={() => void onSubmit()}
      submitLabel="Opprett gren"
      loadingText="Oppretter…"
      navnError={touched ? navnError : null}
      onBlurNavn={() => setTouched(true)}
      mutasjonFeil={opprettGren.error?.message ?? null}
    />
  );
}
