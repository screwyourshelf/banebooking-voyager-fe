import { useEffect, useMemo, useState } from "react";
import { Zap } from "lucide-react";

import { RowPanel, RowList, Row } from "@/components/rows";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import DatoVelger from "@/components/DatoVelger";

import type { BaneRespons } from "@/types";
import type { DayOfWeek } from "@/types";
import { dayOfWeekKortNorsk } from "@/utils/datoUtils";

import {
  finnTilgjengeligeUkedager,
  beregnTidspunkterForBaner,
  grupperBanerEtterSlotLengde,
  genererLokalBookinger,
  type SlotLengdeGruppe,
} from "../../views/arrangement/arrangementUtils";
import type { LokalBooking } from "../../types";

type Props = {
  baner: BaneRespons[];
  onGenerer: (bookinger: LokalBooking[]) => void;
};

const UKEDAGER_REKKEFOLGE: readonly DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function toggleItem<T>(item: T, set: React.Dispatch<React.SetStateAction<T[]>>) {
  set((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
}

export default function GjentakendeOppsett({ baner, onGenerer }: Props) {
  const [datoFra, setDatoFra] = useState<Date>(new Date());
  const [datoTil, setDatoTil] = useState<Date>(new Date());

  const [valgteBaner, setValgteBaner] = useState<string[]>([]);
  const [valgteUkedager, setValgteUkedager] = useState<DayOfWeek[]>([]);

  const [alleBaner, setAlleBaner] = useState(false);
  const [alleUkedager, setAlleUkedager] = useState(false);

  // Per-gruppe tidspunkter (når baner har ulike slot-lengder)
  const [tidspunkterPerGruppe, setTidspunkterPerGruppe] = useState<Record<number, string[]>>({});
  const [allePerGruppe, setAllePerGruppe] = useState<Record<number, boolean>>({});

  // Tilgjengelige ukedager i valgt periode
  const tilgjengeligeUkedager = useMemo(
    () => finnTilgjengeligeUkedager(datoFra, datoTil),
    [datoFra, datoTil]
  );

  // Fjern ukedager som ikke lenger finnes i perioden (render-time adjust)
  const [prevTilgjengeligeUkedager, setPrevTilgjengeligeUkedager] = useState(tilgjengeligeUkedager);
  if (tilgjengeligeUkedager !== prevTilgjengeligeUkedager) {
    setPrevTilgjengeligeUkedager(tilgjengeligeUkedager);
    setValgteUkedager((prev) => prev.filter((d) => tilgjengeligeUkedager.includes(d)));
  }

  // Alle baner → velg alle
  const aktiveBaner = alleBaner ? baner.map((b) => b.id) : valgteBaner;

  // Slot-grupper
  const slotGrupper = useMemo(
    () => grupperBanerEtterSlotLengde(baner, aktiveBaner),
    [baner, aktiveBaner]
  );
  const erGruppert = slotGrupper.length > 1;

  // Flat tidspunkt-beregning (brukes kun for advarsel)
  const tidspunktResultat = useMemo(
    () => beregnTidspunkterForBaner(baner, aktiveBaner),
    [baner, aktiveBaner]
  );

  // Opprydding: hold per-gruppe-state i sync med aktive grupper
  useEffect(() => {
    if (!erGruppert) return;
    setTidspunkterPerGruppe((prev) => {
      const next: Record<number, string[]> = {};
      for (const g of slotGrupper) {
        next[g.slotLengdeMinutter] = (prev[g.slotLengdeMinutter] ?? []).filter((t) =>
          g.tidspunkter.includes(t)
        );
      }
      return next;
    });
    setAllePerGruppe((prev) => {
      const next: Record<number, boolean> = {};
      for (const g of slotGrupper) next[g.slotLengdeMinutter] = prev[g.slotLengdeMinutter] ?? false;
      return next;
    });
  }, [erGruppert, slotGrupper]);

  // Sync "alle" → velg alle tidspunkter per gruppe
  useEffect(() => {
    if (!erGruppert) return;
    setTidspunkterPerGruppe((prev) => {
      const next = { ...prev };
      for (const g of slotGrupper) {
        if (allePerGruppe[g.slotLengdeMinutter]) next[g.slotLengdeMinutter] = g.tidspunkter;
      }
      return next;
    });
  }, [erGruppert, allePerGruppe, slotGrupper]);

  // Ikke-gruppert: felles tidspunkter
  const [valgteTidspunkter, setValgteTidspunkter] = useState<string[]>([]);
  const [alleTidspunkter, setAlleTidspunkter] = useState(false);

  const tilgjengeligeTidspunkter = tidspunktResultat.tidspunkter;

  // Fjern tidspunkter som ikke lenger er tilgjengelige
  const [prevTilgjengeligeTidspunkter, setPrevTilgjengeligeTidspunkter] =
    useState(tilgjengeligeTidspunkter);
  if (tilgjengeligeTidspunkter !== prevTilgjengeligeTidspunkter) {
    setPrevTilgjengeligeTidspunkter(tilgjengeligeTidspunkter);
    if (!erGruppert) {
      setValgteTidspunkter((prev) => prev.filter((t) => tilgjengeligeTidspunkter.includes(t)));
    }
  }

  // Bygg tidspunkterPerGruppe for ikke-gruppert tilfelle
  const effektivTidspunkterPerGruppe: Record<number, string[]> = erGruppert
    ? tidspunkterPerGruppe
    : slotGrupper.length === 1
      ? { [slotGrupper[0].slotLengdeMinutter]: alleTidspunkter ? tilgjengeligeTidspunkter : valgteTidspunkter }
      : {};

  const håndterGenerer = () => {
    const aktiveUkedager = alleUkedager ? tilgjengeligeUkedager : valgteUkedager;

    const bookinger = genererLokalBookinger({
      datoFra,
      datoTil,
      valgteUkedager: aktiveUkedager,
      slotGrupper,
      tidspunkterPerGruppe: effektivTidspunkterPerGruppe,
    });

    onGenerer(bookinger);
  };

  const kanGenerere =
    aktiveBaner.length > 0 &&
    (alleUkedager || valgteUkedager.length > 0) &&
    (erGruppert
      ? slotGrupper.some(
          (g: SlotLengdeGruppe) =>
            allePerGruppe[g.slotLengdeMinutter] ||
            (tidspunkterPerGruppe[g.slotLengdeMinutter] ?? []).length > 0
        )
      : alleTidspunkter || valgteTidspunkter.length > 0);

  return (
    <div className="space-y-3">
      <RowPanel>
        <RowList>
          {/* Periode */}
          <Row title="Fra">
            <DatoVelger value={datoFra} onChange={setDatoFra} visNavigering />
          </Row>
          <Row title="Til">
            <DatoVelger value={datoTil} onChange={setDatoTil} visNavigering />
          </Row>

          {/* Ukedager */}
          <Row
            title="Ukedager"
            right={<Switch checked={alleUkedager} onCheckedChange={setAlleUkedager} />}
          >
            <div className="flex flex-wrap gap-2">
              {UKEDAGER_REKKEFOLGE.map((dag) => (
                <Button
                  key={dag}
                  type="button"
                  variant={valgteUkedager.includes(dag) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleItem(dag, setValgteUkedager)}
                  disabled={alleUkedager || !tilgjengeligeUkedager.includes(dag)}
                >
                  {dayOfWeekKortNorsk(dag)}
                </Button>
              ))}
            </div>
          </Row>

          {/* Baner */}
          <Row
            title="Baner"
            right={<Switch checked={alleBaner} onCheckedChange={setAlleBaner} />}
          >
            <div className="flex flex-wrap gap-2">
              {baner.map((b) => (
                <Button
                  key={b.id}
                  type="button"
                  variant={aktiveBaner.includes(b.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleItem(b.id, setValgteBaner)}
                  disabled={alleBaner}
                >
                  {b.navn}
                </Button>
              ))}
            </div>
          </Row>

          {/* Tidspunkter */}
          {tidspunktResultat.advarselTekst && (
            <div className="px-2 py-2">
              <Alert className="border-amber-200 bg-amber-50 text-amber-700 [&>svg]:text-amber-700">
                <TriangleAlert />
                <AlertDescription>{tidspunktResultat.advarselTekst}</AlertDescription>
              </Alert>
            </div>
          )}

          {erGruppert ? (
            slotGrupper.map((gruppe) => {
              const sl = gruppe.slotLengdeMinutter;
              const valgte = tidspunkterPerGruppe[sl] ?? [];
              const alle = allePerGruppe[sl] ?? false;
              return (
                <Row
                  key={sl}
                  title={`Tidspunkter – ${sl} min`}
                  description={gruppe.baneNavn.join(", ")}
                  right={
                    <Switch
                      checked={alle}
                      onCheckedChange={(v) =>
                        setAllePerGruppe((prev) => ({ ...prev, [sl]: v }))
                      }
                    />
                  }
                >
                  <div className="flex flex-wrap gap-2">
                    {gruppe.tidspunkter.map((tid) => (
                      <Button
                        key={tid}
                        type="button"
                        variant={valgte.includes(tid) ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          setTidspunkterPerGruppe((prev) => ({
                            ...prev,
                            [sl]: valgte.includes(tid)
                              ? valgte.filter((t) => t !== tid)
                              : [...valgte, tid],
                          }))
                        }
                        disabled={alle}
                      >
                        {tid}
                      </Button>
                    ))}
                  </div>
                </Row>
              );
            })
          ) : (
            <Row
              title="Tidspunkter"
              right={
                <Switch checked={alleTidspunkter} onCheckedChange={setAlleTidspunkter} />
              }
            >
              <div className="flex flex-wrap gap-2">
                {tilgjengeligeTidspunkter.map((tid: string) => (
                  <Button
                    key={tid}
                    type="button"
                    variant={
                      (alleTidspunkter || valgteTidspunkter.includes(tid)) ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => toggleItem(tid, setValgteTidspunkter)}
                    disabled={alleTidspunkter}
                  >
                    {tid}
                  </Button>
                ))}
              </div>
            </Row>
          )}
        </RowList>
      </RowPanel>

      <Button
        type="button"
        disabled={!kanGenerere}
        onClick={håndterGenerer}
        className="w-full"
      >
        <Zap className="size-4 mr-1.5" />
        Generer forslag og legg i booking-liste
      </Button>
    </div>
  );
}
