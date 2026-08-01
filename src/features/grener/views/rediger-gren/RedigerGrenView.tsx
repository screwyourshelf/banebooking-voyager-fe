import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Shapes } from "lucide-react";
import {
  AdminEditorDialog,
  AdminEntityCollection,
  AdminEntityList,
  AdminEntityRow,
} from "@/components/admin";
import { RecordCollectionSkeleton, RecordListState } from "@/components/records";
import { Button } from "@/components/ui/button";
import GrenEditorContent, { type GrenFormData } from "@/features/grener/GrenEditorContent";
import { useGrener } from "@/hooks/useGrener";
import type { GrenRespons } from "@/types";
import { loadValgtGrenId, saveValgtGrenId } from "./storage";

type TouchedState = { navn: boolean };

function validateNavn(navn: string): string | null {
  return navn.trim() ? null : "Navn er påkrevd.";
}

function timeToHour(time: string): number {
  const hour = parseInt((time ?? "").split(":")[0] ?? "0", 10);
  return Number.isFinite(hour) ? hour : 0;
}

function hourToTime(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

function toFormData(gren: GrenRespons): GrenFormData {
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

function timeRange(form: GrenFormData) {
  return `${hourToTime(form.aapningstid)}–${hourToTime(form.stengetid)}`;
}

export default function RedigerGrenView() {
  const { grener, isLoading, isFetching, error, refetch, oppdaterGren } = useGrener(true);
  const [redigerte, setRedigerte] = useState<Record<string, GrenFormData>>({});
  const [manuellGrenId, setValgtGrenId] = useState<string | null>(() => loadValgtGrenId());
  const [editorOpen, setEditorOpen] = useState(false);
  const [touched, setTouched] = useState<Record<string, TouchedState>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const valgtGrenId =
    manuellGrenId != null && grener.some((gren) => gren.id === manuellGrenId)
      ? manuellGrenId
      : (grener[0]?.id ?? null);

  const valgtGren = useMemo(
    () => grener.find((gren) => gren.id === valgtGrenId) ?? null,
    [grener, valgtGrenId]
  );
  const redigerteVerdier = valgtGrenId ? (redigerte[valgtGrenId] ?? null) : null;
  const draft = useMemo(
    () => (valgtGren ? (redigerteVerdier ?? toFormData(valgtGren)) : null),
    [valgtGren, redigerteVerdier]
  );

  useEffect(() => {
    saveValgtGrenId(manuellGrenId);
  }, [manuellGrenId]);

  const [prevValgtGrenId, setPrevValgtGrenId] = useState(valgtGrenId);
  if (valgtGrenId !== prevValgtGrenId) {
    setPrevValgtGrenId(valgtGrenId);
    setSubmitAttempted(false);
  }

  function touchNavn(grenId: string) {
    setTouched((current) => {
      if (current[grenId]?.navn) return current;
      return { ...current, [grenId]: { navn: true } };
    });
  }

  function onChange<K extends keyof GrenFormData>(key: K, value: GrenFormData[K]) {
    if (!valgtGrenId || !valgtGren) return;
    setRedigerte((current) => ({
      ...current,
      [valgtGrenId]: {
        ...(current[valgtGrenId] ?? toFormData(valgtGren)),
        [key]: value,
      },
    }));
  }

  const navnError = draft ? validateNavn(draft.navn) : null;
  const showNavnError =
    valgtGrenId && (touched[valgtGrenId]?.navn || submitAttempted) ? navnError : null;
  const isDirty = useMemo(() => {
    if (!valgtGren || !draft) return false;
    const original = toFormData(valgtGren);
    return (Object.keys(original) as Array<keyof GrenFormData>).some(
      (key) => draft[key] !== original[key]
    );
  }, [valgtGren, draft]);
  const canSubmit = isDirty && !navnError;
  const isSaving = oppdaterGren.isPending;

  async function onSubmit() {
    if (!valgtGrenId || !draft || navnError || !isDirty) {
      setSubmitAttempted(true);
      if (valgtGrenId) touchNavn(valgtGrenId);
      return;
    }

    setSubmitAttempted(true);
    touchNavn(valgtGrenId);
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

      setRedigerte((current) => {
        const next = { ...current };
        delete next[valgtGrenId];
        return next;
      });
      setTouched((current) => {
        const next = { ...current };
        delete next[valgtGrenId];
        return next;
      });
      setSubmitAttempted(false);
    } catch {
      // Feilen vises i skjemaet.
    }
  }

  if (isLoading) {
    return (
      <AdminEntityCollection
        icon={<Shapes aria-hidden="true" />}
        title="Laster grener…"
        description="Henter klubbens aktiviteter"
      >
        <RecordCollectionSkeleton ariaLabel="Laster grener" rows={3} />
      </AdminEntityCollection>
    );
  }

  if (error) {
    return (
      <AdminEntityCollection
        icon={<Shapes aria-hidden="true" />}
        title="Grener"
        description="Klubbens aktiviteter"
      >
        <RecordListState
          icon={<RefreshCw aria-hidden="true" />}
          title="Kunne ikke hente grenene"
          description={error.message}
          tone="danger"
          role="alert"
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              {isFetching ? "Prøver igjen…" : "Prøv igjen"}
            </Button>
          }
        />
      </AdminEntityCollection>
    );
  }

  const antallTekst = `${grener.length} ${grener.length === 1 ? "gren" : "grener"}`;
  const editorNavn = draft?.navn.trim() || valgtGren?.navn || "Gren";

  return (
    <>
      <AdminEntityCollection
        icon={<Shapes aria-hidden="true" />}
        title={antallTekst}
        description="Velg en gren for å redigere"
      >
        {grener.length === 0 ? (
          <RecordListState
            icon={<Shapes aria-hidden="true" />}
            title="Ingen grener ennå"
            description="Bruk knappen Ny gren for å opprette den første."
          />
        ) : (
          <AdminEntityList>
            {grener.map((gren) => {
              const rowDraft = redigerte[gren.id];
              const values = rowDraft ?? toFormData(gren);
              const erEndret = !!rowDraft;

              return (
                <AdminEntityRow
                  key={gren.id}
                  title={values.navn.trim() || gren.navn}
                  meta={timeRange(values)}
                  description={`${values.slotLengdeMinutter} min · maks ${values.maksPerDag} per dag`}
                  status={erEndret ? "Ulagret" : values.aktiv ? "Aktiv" : "Inaktiv"}
                  statusTone={erEndret ? "warning" : values.aktiv ? "available" : "past"}
                  onSelect={() => {
                    setValgtGrenId(gren.id);
                    setEditorOpen(true);
                  }}
                  disabled={isSaving}
                />
              );
            })}
          </AdminEntityList>
        )}
      </AdminEntityCollection>

      {valgtGren && draft ? (
        <AdminEditorDialog
          open={editorOpen}
          onOpenChange={(open) => {
            if (!isSaving) setEditorOpen(open);
          }}
          backLabel="Alle grener"
          eyebrow="Rediger gren"
          title={editorNavn}
          description={`${draft.aktiv ? "Aktiv" : "Inaktiv"} · ${timeRange(draft)}`}
          closeDisabled={isSaving}
        >
          <GrenEditorContent
            form={draft}
            onChange={onChange}
            showActive
            canSubmit={canSubmit}
            isSaving={isSaving}
            onSubmit={() => void onSubmit()}
            submitLabel="Lagre endringer"
            loadingText="Lagrer…"
            navnError={showNavnError}
            onBlurNavn={() => {
              if (valgtGrenId) touchNavn(valgtGrenId);
            }}
            mutasjonFeil={oppdaterGren.error?.message ?? null}
          />
        </AdminEditorDialog>
      ) : null}
    </>
  );
}
