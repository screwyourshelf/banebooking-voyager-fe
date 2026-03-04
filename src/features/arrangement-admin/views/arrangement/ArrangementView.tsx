import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { FormSkeleton } from "@/components/loading";
import { useArrangement } from "../../hooks/useArrangement";

import ArrangementContent from "./ArrangementContent";
import {
  byggDto,
  finnTilgjengeligeUkedager,
  beregnTidspunkterForBaner,
  grupperBanerEtterSlotLengde,
} from "./arrangementUtils";

import type { ArrangementKategori, DayOfWeek } from "@/types";

const KATEGORIER = [
  "Trening",
  "Turnering",
  "Klubbmersterskap",
  "Kurs",
  "Lagkamp",
  "Stigespill",
  "Dugnad",
  "Vedlikehold",
  "Sosialt",
  "Annet",
] as const satisfies readonly ArrangementKategori[];

function toggleItem<T>(item: T, set: React.Dispatch<React.SetStateAction<T[]>>) {
  set((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
}

export default function ArrangementView() {
  const {
    baner,
    tilgjengeligeTidspunkter: standardTidspunkter,
    forhandsvisning,
    forhandsvis,
    clearForhandsvisning,
    opprett,
    isLoading,
    isLoadingForhandsvisning,
  } = useArrangement();

  const [datoFra, setDatoFra] = useState<Date>(new Date());
  const [datoTil, setDatoTil] = useState<Date>(new Date());

  const [valgteBaner, setValgteBaner] = useState<string[]>([]);
  const [valgteUkedager, setValgteUkedager] = useState<DayOfWeek[]>([]);
  const [valgteTidspunkter, setValgteTidspunkter] = useState<string[]>([]);

  const [alleBaner, setAlleBaner] = useState(false);
  const [alleUkedager, setAlleUkedager] = useState(false);
  const [alleTidspunkter, setAlleTidspunkter] = useState(false);

  const [kategori, setKategori] = useState<ArrangementKategori>("Annet");
  const [beskrivelse, setBeskrivelse] = useState("");
  const [tillaterPaamelding, setTillaterPaamelding] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);

  // ───────── Per-gruppe state (brukes når baner har ulike slot-lengder) ─────────
  const [tidspunkterPerGruppe, setTidspunkterPerGruppe] = useState<Record<number, string[]>>({});
  const [allePerGruppe, setAllePerGruppe] = useState<Record<number, boolean>>({});

  const tilgjengeligeUkedager = useMemo(
    () => finnTilgjengeligeUkedager(datoFra, datoTil),
    [datoFra, datoTil]
  );

  // Flat tidspunkter (brukes når alle baner har lik slot-lengde)
  const tidspunktResultat = useMemo(() => {
    if (valgteBaner.length === 0) {
      return {
        tidspunkter: standardTidspunkter,
        harUlikSlotLengde: false,
        advarselTekst: undefined,
      };
    }
    return beregnTidspunkterForBaner(baner, valgteBaner);
  }, [baner, valgteBaner, standardTidspunkter]);

  const tilgjengeligeTidspunkter = tidspunktResultat.tidspunkter;
  const slotLengdeAdvarsel = tidspunktResultat.advarselTekst;

  // Slot-grupper (gruppering etter slot-lengde)
  const slotGrupper = useMemo(
    () => grupperBanerEtterSlotLengde(baner, valgteBaner),
    [baner, valgteBaner]
  );
  const erGruppert = slotGrupper.length > 1;

  // Sync "alle X" → valgte lister
  useEffect(() => {
    if (alleBaner) setValgteBaner(baner.map((b) => b.id));
  }, [alleBaner, baner]);

  useEffect(() => {
    if (alleUkedager) setValgteUkedager(tilgjengeligeUkedager);
  }, [alleUkedager, tilgjengeligeUkedager]);

  useEffect(() => {
    if (!erGruppert && alleTidspunkter) setValgteTidspunkter(tilgjengeligeTidspunkter);
  }, [erGruppert, alleTidspunkter, tilgjengeligeTidspunkter]);

  // Når dato-periode endres: fjern ukedager som ikke lenger er gyldige
  useEffect(() => {
    setValgteUkedager((prev) => prev.filter((d) => tilgjengeligeUkedager.includes(d)));
  }, [tilgjengeligeUkedager]);

  // Fjern flat-tidspunkter som ikke lenger er tilgjengelige
  useEffect(() => {
    if (!erGruppert) {
      setValgteTidspunkter((prev) => prev.filter((t) => tilgjengeligeTidspunkter.includes(t)));
    }
  }, [erGruppert, tilgjengeligeTidspunkter]);

  // ───────── Per-gruppe effekter ─────────

  // Opprydding: hold per-gruppe-state i sync med aktive grupper
  useEffect(() => {
    if (!erGruppert) return;

    setTidspunkterPerGruppe((prev) => {
      const next: Record<number, string[]> = {};
      for (const gruppe of slotGrupper) {
        const sl = gruppe.slotLengdeMinutter;
        next[sl] = (prev[sl] ?? []).filter((t) => gruppe.tidspunkter.includes(t));
      }
      return next;
    });

    setAllePerGruppe((prev) => {
      const next: Record<number, boolean> = {};
      for (const gruppe of slotGrupper) {
        next[gruppe.slotLengdeMinutter] = prev[gruppe.slotLengdeMinutter] ?? false;
      }
      return next;
    });
  }, [erGruppert, slotGrupper]);

  // Sync "alle" → valgte tidspunkter per gruppe
  useEffect(() => {
    if (!erGruppert) return;

    setTidspunkterPerGruppe((prev) => {
      const next = { ...prev };
      for (const gruppe of slotGrupper) {
        const sl = gruppe.slotLengdeMinutter;
        if (allePerGruppe[sl]) {
          next[sl] = gruppe.tidspunkter;
        }
      }
      return next;
    });
  }, [erGruppert, allePerGruppe, slotGrupper]);

  // ───────── DTO-bygging ─────────

  const byggBaneGrupper = () => {
    if (erGruppert) {
      return slotGrupper.map((g) => ({
        baneIder: g.baneIder,
        tidspunkter: tidspunkterPerGruppe[g.slotLengdeMinutter] ?? [],
      }));
    }
    return [{ baneIder: valgteBaner, tidspunkter: valgteTidspunkter }];
  };

  const dtoOrNull = () =>
    byggDto({
      datoFra,
      datoTil,
      baneGrupper: byggBaneGrupper(),
      valgteUkedager,
      kategori,
      beskrivelse,
      tillaterPaamelding,
      onWarning: (msg) => toast.warning(msg),
    });

  // ───────── Forhåndsvisning & opprett ─────────

  const åpneForhandsvisning = async () => {
    const dto = dtoOrNull();
    if (!dto) return;
    setDialogOpen(true);
    await forhandsvis(dto);
  };

  const håndterOpprett = async () => {
    const dto = dtoOrNull();
    if (!dto) return;
    await opprett(dto);
    clearForhandsvisning();
    setDialogOpen(false);
  };

  // ───────── Per-gruppe toggle-handlers ─────────

  const toggleTidspunktForGruppe = (slotLengde: number, tid: string) => {
    setTidspunkterPerGruppe((prev) => ({
      ...prev,
      [slotLengde]: prev[slotLengde]?.includes(tid)
        ? prev[slotLengde].filter((t) => t !== tid)
        : [...(prev[slotLengde] ?? []), tid],
    }));
  };

  const toggleAlleForGruppe = (slotLengde: number, v: boolean) => {
    setAllePerGruppe((prev) => ({ ...prev, [slotLengde]: v }));
  };

  if (isLoading) return <FormSkeleton />;

  return (
    <ArrangementContent
      kategorier={KATEGORIER}
      kategori={kategori}
      beskrivelse={beskrivelse}
      datoFra={datoFra}
      datoTil={datoTil}
      baner={baner}
      tilgjengeligeUkedager={tilgjengeligeUkedager}
      tilgjengeligeTidspunkter={tilgjengeligeTidspunkter}
      valgteBaner={valgteBaner}
      valgteUkedager={valgteUkedager}
      valgteTidspunkter={valgteTidspunkter}
      alleBaner={alleBaner}
      alleUkedager={alleUkedager}
      alleTidspunkter={alleTidspunkter}
      dialogOpen={dialogOpen}
      forhandsvisning={forhandsvisning}
      isLoadingForhandsvisning={isLoadingForhandsvisning}
      onChangeKategori={setKategori}
      onChangeBeskrivelse={setBeskrivelse}
      tillaterPaamelding={tillaterPaamelding}
      onChangeTillaterPaamelding={setTillaterPaamelding}
      onChangeDatoFra={setDatoFra}
      onChangeDatoTil={setDatoTil}
      onToggleAlleBaner={setAlleBaner}
      onToggleAlleUkedager={setAlleUkedager}
      onToggleAlleTidspunkter={setAlleTidspunkter}
      onToggleBane={(id) => toggleItem(id, setValgteBaner)}
      onToggleUkedag={(dag) => toggleItem(dag, setValgteUkedager)}
      onToggleTidspunkt={(tid) => toggleItem(tid, setValgteTidspunkter)}
      onOpenPreview={åpneForhandsvisning}
      onCreate={håndterOpprett}
      onDialogOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) clearForhandsvisning();
      }}
      slotLengdeAdvarsel={slotLengdeAdvarsel}
      slotGrupper={erGruppert ? slotGrupper : undefined}
      tidspunkterPerGruppe={erGruppert ? tidspunkterPerGruppe : undefined}
      allePerGruppe={erGruppert ? allePerGruppe : undefined}
      onToggleAlleForGruppe={erGruppert ? toggleAlleForGruppe : undefined}
      onToggleTidspunktForGruppe={erGruppert ? toggleTidspunktForGruppe : undefined}
    />
  );
}
