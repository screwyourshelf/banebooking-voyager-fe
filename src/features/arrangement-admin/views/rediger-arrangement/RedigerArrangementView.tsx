import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { FormSkeleton } from "@/components/loading";
import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row } from "@/components/rows";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useRedigerArrangement } from "../../hooks/useRedigerArrangement";
import { useAvlysArrangement } from "../../hooks/useAvlysArrangement";
import { SlettArrangementDialog } from "../../components";
import { useSlug } from "@/hooks/useSlug";
import { useOpprettTurnering } from "@/features/turnering/hooks/turnering/useOpprettTurnering";
import ArrangementContent from "../arrangement/ArrangementContent";
import {
  byggDto,
  finnTilgjengeligeUkedager,
  beregnTidspunkterForBaner,
  grupperBanerEtterSlotLengde,
} from "../arrangement/arrangementUtils";

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

function formatDatoKort(s: string): string {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

function parseDatoString(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default function RedigerArrangementView() {
  const [valgtId, setValgtId] = useState<string>("");
  const [valgtGrenId, setValgtGrenId] = useState("");
  const slug = useSlug();
  const navigate = useNavigate();
  const turneringMutation = useOpprettTurnering();

  const {
    arrangementer,
    arrangement,
    grener,
    baner: alleBanerData,
    tilgjengeligeTidspunkter: standardTidspunkter,
    forhandsvisning,
    forhandsvis,
    clearForhandsvisning,
    erstatt,
    erstattFeil,
    forhandsvisFeil,
    isLoading,
    isLoadingArrangementer,
    isLoadingForhandsvisning,
  } = useRedigerArrangement(valgtId || null, valgtGrenId);

  // Filtrer baner til valgt gren
  const baner = useMemo(
    () => (valgtGrenId ? alleBanerData.filter((b) => b.grenId === valgtGrenId) : alleBanerData),
    [alleBanerData, valgtGrenId]
  );

  const { avlys } = useAvlysArrangement();

  // Pre-select gren (render-time adjust)
  if (!valgtGrenId && grener.length > 0) {
    setValgtGrenId(grener[0].id);
  }

  const handleGrenChange = (grenId: string) => {
    setValgtGrenId(grenId);
    setValgteBaner([]);
    setValgteUkedager([]);
    setValgteTidspunkter([]);
    setAlleBaner(false);
    setAlleUkedager(false);
    setAlleTidspunkter(false);
    setTidspunkterPerGruppe({});
    setAllePerGruppe({});
  };

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
  const [nettsideTittel, setNettsideTittel] = useState("");
  const [nettsideBeskrivelse, setNettsideBeskrivelse] = useState("");
  const [publisertPåNettsiden, setPublisertPåNettsiden] = useState(false);
  const [tillaterPaamelding, setTillaterPaamelding] = useState(false);
  const [ønskerTurnering, setØnskerTurnering] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [prefyltId, setPrefyltId] = useState<string | null>(null);

  // ───────── Per-gruppe state (brukes når baner har ulike slot-lengder) ─────────
  const [tidspunkterPerGruppe, setTidspunkterPerGruppe] = useState<Record<number, string[]>>({});
  const [allePerGruppe, setAllePerGruppe] = useState<Record<number, boolean>>({});

  // Pre-fyll skjema når arrangementdata lastes (render-time adjust)
  const [prevArrangementId, setPrevArrangementId] = useState<string | null>(null);
  const arrangementId = arrangement?.id ?? null;
  if (arrangementId !== prevArrangementId) {
    setPrevArrangementId(arrangementId);
    if (!arrangement) {
      setPrefyltId(null);
    } else {
      setKategori(arrangement.kategori);
      setBeskrivelse(arrangement.beskrivelse ?? "");
      setNettsideTittel(arrangement.nettsideTittel ?? "");
      setNettsideBeskrivelse(arrangement.nettsideBeskrivelse ?? "");
      setPublisertPåNettsiden(arrangement.publisertPåNettsiden ?? false);
      setTillaterPaamelding(arrangement.tillaterPaamelding);
      setDatoFra(parseDatoString(arrangement.startDato));
      setDatoTil(parseDatoString(arrangement.sluttDato));

      const alleBaneIder = arrangement.baneGrupper.flatMap((g) => g.baneIder);
      setValgteBaner(alleBaneIder);
      setValgteUkedager(arrangement.ukedager);
      setValgteTidspunkter([...new Set(arrangement.baneGrupper.flatMap((g) => g.tidspunkter))]);

      const grupper = grupperBanerEtterSlotLengde(baner, alleBaneIder);
      if (grupper.length > 1) {
        const baneIdTilTider = new Map<string, string[]>();
        for (const g of arrangement.baneGrupper) {
          for (const id of g.baneIder) {
            baneIdTilTider.set(id, g.tidspunkter);
          }
        }
        const perGruppe: Record<number, string[]> = {};
        const alleFlags: Record<number, boolean> = {};
        for (const computed of grupper) {
          perGruppe[computed.slotLengdeMinutter] = baneIdTilTider.get(computed.baneIder[0]) ?? [];
          alleFlags[computed.slotLengdeMinutter] = false;
        }
        setTidspunkterPerGruppe(perGruppe);
        setAllePerGruppe(alleFlags);
      } else {
        setTidspunkterPerGruppe({});
        setAllePerGruppe({});
      }

      setAlleBaner(false);
      setAlleUkedager(false);
      setAlleTidspunkter(false);
      setØnskerTurnering(false);
      setPrefyltId(arrangement.id);
    }
  }

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

  // Filter invalid selections when available options change (render-time adjust)
  const [prevTilgjengeligeUkedager, setPrevTilgjengeligeUkedager] = useState(tilgjengeligeUkedager);
  const [prevTilgjengeligeTidspunkter, setPrevTilgjengeligeTidspunkter] =
    useState(tilgjengeligeTidspunkter);

  if (tilgjengeligeUkedager !== prevTilgjengeligeUkedager) {
    setPrevTilgjengeligeUkedager(tilgjengeligeUkedager);
    setValgteUkedager((prev) => prev.filter((d) => tilgjengeligeUkedager.includes(d)));
  }
  if (tilgjengeligeTidspunkter !== prevTilgjengeligeTidspunkter) {
    setPrevTilgjengeligeTidspunkter(tilgjengeligeTidspunkter);
    if (!erGruppert) {
      setValgteTidspunkter((prev) => prev.filter((t) => tilgjengeligeTidspunkter.includes(t)));
    }
  }

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
      grenId: valgtGrenId,
      datoFra,
      datoTil,
      baneGrupper: byggBaneGrupper(),
      valgteUkedager,
      kategori,
      beskrivelse,
      nettsideTittel,
      nettsideBeskrivelse,
      publisertPåNettsiden,
      tillaterPaamelding,
      onWarning: (msg) => toast.warning(msg),
    });

  const åpneForhandsvisning = async () => {
    const dto = dtoOrNull();
    if (!dto) return;
    setDialogOpen(true);
    await forhandsvis(dto);
  };

  const håndterOppdater = async () => {
    const dto = dtoOrNull();
    if (!dto) return;
    try {
      await erstatt(dto);
      if (ønskerTurnering && !arrangement?.turneringId) {
        await turneringMutation.mutateAsync({ arrangementId: arrangement!.id });
      }
      clearForhandsvisning();
      setDialogOpen(false);
    } catch {
      // feil vises via erstattFeil / turneringMutation.error
    }
  };

  const skalFjernePaameldte =
    (arrangement?.tillaterPaamelding ?? false) &&
    !tillaterPaamelding &&
    (arrangement?.antallPaameldte ?? 0) > 0;

  const advarsel = skalFjernePaameldte
    ? `${arrangement!.antallPaameldte} påmelding(er) vil bli fjernet.`
    : undefined;

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

  return (
    <>
      <PageSection
        title="Rediger arrangement"
        description="Velg arrangementet du vil redigere eller avlyse."
      >
        <RowPanel>
          <RowList>
            <Row title="Arrangement">
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <Field>
                    <Label htmlFor="velg-arrangement" className="sr-only">
                      Arrangement
                    </Label>

                    <Select
                      value={valgtId}
                      onValueChange={setValgtId}
                      disabled={isLoadingArrangementer}
                    >
                      <SelectTrigger id="velg-arrangement">
                        <SelectValue
                          placeholder={
                            isLoadingArrangementer ? "Henter arrangementer…" : "Velg arrangement…"
                          }
                        />
                      </SelectTrigger>

                      <SelectContent>
                        {(() => {
                          const aktive = arrangementer?.filter((a) => !a.erPassert) ?? [];
                          const passerte = arrangementer?.filter((a) => a.erPassert) ?? [];
                          return (
                            <>
                              {aktive.length > 0 && (
                                <SelectGroup>
                                  <SelectLabel>Aktive og kommende</SelectLabel>
                                  {aktive.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                      {a.tittel} — {formatDatoKort(a.startDato)} –{" "}
                                      {formatDatoKort(a.sluttDato)}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              )}
                              {aktive.length > 0 && passerte.length > 0 && <SelectSeparator />}
                              {passerte.length > 0 && (
                                <SelectGroup>
                                  <SelectLabel>Passerte</SelectLabel>
                                  {passerte.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                      {a.tittel} — {formatDatoKort(a.startDato)} –{" "}
                                      {formatDatoKort(a.sluttDato)}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              )}
                            </>
                          );
                        })()}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                {arrangement && prefyltId === arrangement.id && (
                  <SlettArrangementDialog
                    tittel={arrangement.tittel}
                    harTurnering={arrangement.turneringId !== null}
                    onSlett={async () => {
                      await avlys(arrangement.id);
                      setValgtId("");
                    }}
                    trigger={<Button variant="destructive">Avlys</Button>}
                  />
                )}
              </div>
            </Row>
          </RowList>
        </RowPanel>
      </PageSection>

      {valgtId && (isLoading || (!!arrangement && prefyltId !== arrangement.id)) && (
        <FormSkeleton />
      )}

      {valgtId && !isLoading && arrangement && prefyltId === arrangement.id && (
        <ArrangementContent
          grener={grener}
          valgtGrenId={valgtGrenId}
          onGrenChange={handleGrenChange}
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
          nettsideTittel={nettsideTittel}
          nettsideBeskrivelse={nettsideBeskrivelse}
          publisertPåNettsiden={publisertPåNettsiden}
          onChangeNettsideTittel={setNettsideTittel}
          onChangeNettsideBeskrivelse={setNettsideBeskrivelse}
          onChangePublisertPåNettsiden={setPublisertPåNettsiden}
          tillaterPaamelding={tillaterPaamelding}
          tillaterPaameldingDisabled={!!arrangement.turneringId}
          onChangeTillaterPaamelding={(v) => {
            setTillaterPaamelding(v);
            if (v) setØnskerTurnering(false);
          }}
          tillaterTurnering={!!arrangement.turneringId || ønskerTurnering}
          tillaterTurneringDisabled={!!arrangement.turneringId}
          onChangeTillaterTurnering={(v) => {
            setØnskerTurnering(v);
            if (v) setTillaterPaamelding(false);
          }}
          onNavigerTilTurnering={
            arrangement.turneringId
              ? () => navigate(`/${slug}/turnering/${arrangement.turneringId}`)
              : undefined
          }
          onChangeDatoFra={setDatoFra}
          onChangeDatoTil={setDatoTil}
          onToggleAlleBaner={(v) => {
            setAlleBaner(v);
            if (v) setValgteBaner(baner.map((b) => b.id));
          }}
          onToggleAlleUkedager={(v) => {
            setAlleUkedager(v);
            if (v) setValgteUkedager(tilgjengeligeUkedager);
          }}
          onToggleAlleTidspunkter={(v) => {
            setAlleTidspunkter(v);
            if (v && !erGruppert) setValgteTidspunkter(tilgjengeligeTidspunkter);
          }}
          onToggleBane={(id) => toggleItem(id, setValgteBaner)}
          onToggleUkedag={(dag) => toggleItem(dag, setValgteUkedager)}
          onToggleTidspunkt={(tid) => toggleItem(tid, setValgteTidspunkter)}
          onOpenPreview={åpneForhandsvisning}
          onCreate={håndterOppdater}
          onDialogOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) clearForhandsvisning();
          }}
          bekreftTekst={`Oppdater ${forhandsvisning.ledige.length} bookinger`}
          advarsel={advarsel}
          slotLengdeAdvarsel={slotLengdeAdvarsel}
          slotGrupper={erGruppert ? slotGrupper : undefined}
          tidspunkterPerGruppe={erGruppert ? tidspunkterPerGruppe : undefined}
          allePerGruppe={erGruppert ? allePerGruppe : undefined}
          onToggleAlleForGruppe={erGruppert ? toggleAlleForGruppe : undefined}
          onToggleTidspunktForGruppe={erGruppert ? toggleTidspunktForGruppe : undefined}
          serverFeil={
            erstattFeil?.message ??
            forhandsvisFeil?.message ??
            turneringMutation.error?.message ??
            null
          }
        />
      )}
    </>
  );
}
