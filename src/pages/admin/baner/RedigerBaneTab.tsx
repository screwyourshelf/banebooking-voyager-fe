import { useState, useEffect } from "react";
import { useBaner } from "@/hooks/useBaner.js";

import { Button } from "@/components/ui/button.js";
import { FormField } from "@/components/FormField.js";
import { SelectField } from "@/components/SelectField.js";
import PageSection from "@/components/PageSection.js";

type BaneFormData = {
  navn: string;
  beskrivelse: string;
  aktiv: boolean;
};

type Props = { slug: string };
const STORAGE_KEY = "rediger.valgtBaneId";

export default function RedigerBaneTab({ slug }: Props) {
  const { baner, isLoading, oppdaterBane } = useBaner(slug, true);

  const [redigerte, setRedigerte] = useState<Record<string, BaneFormData>>({});
  const [valgtBaneId, setValgtBaneId] = useState<string | null>(() => {
    const fraStorage = sessionStorage.getItem(STORAGE_KEY);
    return fraStorage && fraStorage !== "null" ? fraStorage : null;
  });

  const valgtBane = baner.find((b) => b.id === valgtBaneId) ?? null;
  const redigerteVerdier =
    valgtBaneId ? redigerte[valgtBaneId] ?? null : null;

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, valgtBaneId ?? "null");
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

  function håndterEndring(
    id: string,
    felt: keyof BaneFormData,
    verdi: string | boolean
  ) {
    setRedigerte((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? baner.find((b) => b.id === id)!),
        [felt]: verdi,
      },
    }));
  }

  async function lagre(id: string) {
    const oppdatert = redigerte[id];
    if (!oppdatert) return;

    try {
      await oppdaterBane.mutateAsync({ id, dto: oppdatert });
      setRedigerte((prev) => {
        const ny = { ...prev };
        delete ny[id];
        return ny;
      });
    } catch {
      // Feil håndteres i hook (toast)
    }
  }

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Laster...
      </p>
    );
  }

  return (
    <PageSection bordered className="space-y-4">
      <SelectField
        id="velg-bane"
        label="Velg bane"
        value={valgtBaneId ?? ""}
        onChange={(val) => setValgtBaneId(val || null)}
        options={baner.map((b) => ({
          label: `${b.navn} ${b.aktiv ? "" : "(inaktiv)"}`,
          value: b.id,
        }))}
      />

      {valgtBane && (
        <>
          <FormField
            id="navn"
            label="Navn"
            value={redigerteVerdier?.navn ?? valgtBane.navn}
            onChange={(e) =>
              håndterEndring(valgtBane.id, "navn", e.target.value)
            }
          />

          <FormField
            id="beskrivelse"
            label="Beskrivelse"
            value={redigerteVerdier?.beskrivelse ?? valgtBane.beskrivelse}
            onChange={(e) =>
              håndterEndring(valgtBane.id, "beskrivelse", e.target.value)
            }
          />

          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={redigerteVerdier?.aktiv ?? valgtBane.aktiv}
              onChange={(e) =>
                håndterEndring(valgtBane.id, "aktiv", e.target.checked)
              }
            />
            <span>Aktiv</span>
          </label>

          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                lagre(valgtBane.id);
              }}
              disabled={
                !redigerteVerdier ||
                (redigerteVerdier.navn === valgtBane.navn &&
                  redigerteVerdier.beskrivelse === valgtBane.beskrivelse &&
                  redigerteVerdier.aktiv === valgtBane.aktiv)
              }
            >
              {oppdaterBane.isPending ? "Lagrer..." : "Lagre"}
            </Button>
          </div>
        </>
      )}
    </PageSection>
  );
}
