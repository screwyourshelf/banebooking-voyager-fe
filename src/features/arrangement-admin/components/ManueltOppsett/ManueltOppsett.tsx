import { useEffect, useMemo, useState } from "react";
import { nb } from "date-fns/locale";
import { PlusCircle, TriangleAlert } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { RowPanel, RowList, Row } from "@/components/rows";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

import type { BaneRespons } from "@/types";
import { tilDatoTekst } from "@/utils/datoUtils";

import {
  beregnTidspunkterForBaner,
  grupperBanerEtterSlotLengde,
  type SlotLengdeGruppe,
} from "../../views/arrangement/arrangementUtils";
import type { LokalBooking } from "../../types";

type Props = {
  baner: BaneRespons[];
  onLeggTil: (bookinger: LokalBooking[]) => void;
};

function leggTilMinutter(tid: string, minutter: number): string {
  const [h, m] = tid.split(":").map(Number);
  const total = h * 60 + m + minutter;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Genererer dato × bane × tidspunkt – ingen ukedag-logikk. */
function genererFraDatoer(
  datoer: Date[],
  slotGrupper: SlotLengdeGruppe[],
  tidspunkterPerGruppe: Record<number, string[]>
): LokalBooking[] {
  const bookinger: LokalBooking[] = [];
  for (const dato of datoer) {
    const datoStr = tilDatoTekst(dato);
    for (const gruppe of slotGrupper) {
      const tidspunkter = tidspunkterPerGruppe[gruppe.slotLengdeMinutter] ?? [];
      for (const startTid of tidspunkter) {
        const sluttTid = leggTilMinutter(startTid, gruppe.slotLengdeMinutter);
        for (let bi = 0; bi < gruppe.baneIder.length; bi++) {
          bookinger.push({
            id: crypto.randomUUID(),
            dato: datoStr,
            startTid,
            sluttTid,
            baneId: gruppe.baneIder[bi],
            baneNavn: gruppe.baneNavn[bi],
            status: "ukjent",
            kilde: "manuell",
          });
        }
      }
    }
  }
  return bookinger;
}

function toggleItem<T>(item: T, set: React.Dispatch<React.SetStateAction<T[]>>) {
  set((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
}

export default function ManueltOppsett({ baner, onLeggTil }: Props) {
  const [valgteDataer, setValgteDataer] = useState<Date[]>([]);
  const [valgteBaneIder, setValgteBaneIder] = useState<string[]>([]);

  // Per-gruppe tidspunkter (baner med ulik slot-lengde)
  const [tidspunkterPerGruppe, setTidspunkterPerGruppe] = useState<Record<number, string[]>>({});
  const [allePerGruppe, setAllePerGruppe] = useState<Record<number, boolean>>({});

  // Ikke-gruppert: felles tidspunkter
  const [valgteTidspunkter, setValgteTidspunkter] = useState<string[]>([]);
  const [alleTidspunkter, setAlleTidspunkter] = useState(false);

  const slotGrupper = useMemo(
    () => grupperBanerEtterSlotLengde(baner, valgteBaneIder),
    [baner, valgteBaneIder]
  );
  const erGruppert = slotGrupper.length > 1;

  const tidspunktResultat = useMemo(
    () => beregnTidspunkterForBaner(baner, valgteBaneIder),
    [baner, valgteBaneIder]
  );
  const tilgjengeligeTidspunkter = tidspunktResultat.tidspunkter;

  // Fjern tidspunkter som faller bort ved banevalg-endring
  const [prevTilgjengeligeTidspunkter, setPrevTilgjengeligeTidspunkter] =
    useState(tilgjengeligeTidspunkter);
  if (tilgjengeligeTidspunkter !== prevTilgjengeligeTidspunkter) {
    setPrevTilgjengeligeTidspunkter(tilgjengeligeTidspunkter);
    if (!erGruppert) {
      setValgteTidspunkter((prev) => prev.filter((t) => tilgjengeligeTidspunkter.includes(t)));
    }
  }

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
  }, [erGruppert, slotGrupper]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync "alle" → velg alle tidspunkter i grupperte modus
  useEffect(() => {
    if (!erGruppert) return;
    setTidspunkterPerGruppe((prev) => {
      const next = { ...prev };
      for (const g of slotGrupper) {
        if (allePerGruppe[g.slotLengdeMinutter]) next[g.slotLengdeMinutter] = g.tidspunkter;
      }
      return next;
    });
  }, [erGruppert, allePerGruppe, slotGrupper]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effektiv tidspunkt-mapping brukt til generering og teller
  const effektivTidspunkterPerGruppe: Record<number, string[]> = erGruppert
    ? tidspunkterPerGruppe
    : slotGrupper.length === 1
      ? {
          [slotGrupper[0].slotLengdeMinutter]: alleTidspunkter
            ? tilgjengeligeTidspunkter
            : valgteTidspunkter,
        }
      : {};

  const antallBookinger =
    valgteDataer.length *
    slotGrupper.reduce((sum, g) => {
      const aktive = effektivTidspunkterPerGruppe[g.slotLengdeMinutter] ?? [];
      return sum + g.baneIder.length * aktive.length;
    }, 0);

  const kanLeggeTil =
    valgteDataer.length > 0 &&
    valgteBaneIder.length > 0 &&
    (erGruppert
      ? slotGrupper.some(
          (g: SlotLengdeGruppe) =>
            allePerGruppe[g.slotLengdeMinutter] ||
            (tidspunkterPerGruppe[g.slotLengdeMinutter] ?? []).length > 0
        )
      : alleTidspunkter || valgteTidspunkter.length > 0);

  const håndterLeggTil = () => {
    if (!kanLeggeTil) return;
    onLeggTil(genererFraDatoer(valgteDataer, slotGrupper, effektivTidspunkterPerGruppe));
    // Tilbakestill datoer – behold bane + tidspunkt for rask batch-innlegging
    setValgteDataer([]);
  };

  return (
    <div className="space-y-3">
      <RowPanel>
        <RowList>
          {/* Datovelger */}
          <Row title="Velg dato(er)" description="Klikk for å velge én eller flere datoer.">
            <Calendar
              mode="multiple"
              selected={valgteDataer}
              onSelect={(datoer) => setValgteDataer(datoer ?? [])}
              locale={nb}
              className="rounded-md border w-fit"
            />
            {valgteDataer.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {valgteDataer.length} dato{valgteDataer.length !== 1 ? "er" : ""} valgt
              </p>
            )}
          </Row>

          {/* Banevalg */}
          <Row title="Bane(r)">
            <div className="flex flex-wrap gap-2">
              {baner.map((b) => (
                <Button
                  key={b.id}
                  type="button"
                  variant={valgteBaneIder.includes(b.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleItem(b.id, setValgteBaneIder)}
                >
                  {b.navn}
                </Button>
              ))}
            </div>
          </Row>

          {/* Advarsel ved ulike slot-lengder */}
          {tidspunktResultat.advarselTekst && (
            <div className="px-2 py-2">
              <Alert className="border-amber-200 bg-amber-50 text-amber-700 [&>svg]:text-amber-700">
                <TriangleAlert />
                <AlertDescription>{tidspunktResultat.advarselTekst}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Tidspunkter – chip-grid */}
          {erGruppert
            ? slotGrupper.map((gruppe) => {
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
            : valgteBaneIder.length > 0 && (
                <Row
                  title="Tidspunkter"
                  right={
                    <Switch checked={alleTidspunkter} onCheckedChange={setAlleTidspunkter} />
                  }
                >
                  <div className="flex flex-wrap gap-2">
                    {tilgjengeligeTidspunkter.map((tid) => (
                      <Button
                        key={tid}
                        type="button"
                        variant={
                          alleTidspunkter || valgteTidspunkter.includes(tid)
                            ? "default"
                            : "outline"
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

      {!kanLeggeTil && (
        <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5 px-1">
          {valgteDataer.length === 0 && <li>Velg minst én dato</li>}
          {valgteBaneIder.length === 0 && <li>Velg minst én bane</li>}
          {valgteBaneIder.length > 0 && !alleTidspunkter && valgteTidspunkter.length === 0 && !erGruppert && (
            <li>Velg minst ett tidspunkt</li>
          )}
          {valgteBaneIder.length > 0 &&
            erGruppert &&
            !slotGrupper.some(
              (g) =>
                allePerGruppe[g.slotLengdeMinutter] ||
                (tidspunkterPerGruppe[g.slotLengdeMinutter] ?? []).length > 0
            ) && <li>Velg minst ett tidspunkt</li>}
        </ul>
      )}

      {kanLeggeTil && (
        <p className="text-xs text-muted-foreground px-1">
          {antallBookinger} booking{antallBookinger !== 1 ? "er" : ""} vil legges til i liste
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        disabled={!kanLeggeTil}
        onClick={håndterLeggTil}
        className="w-full"
      >
        <PlusCircle className="size-4 mr-1.5" />
        {kanLeggeTil
          ? `Legg til ${antallBookinger} booking${antallBookinger !== 1 ? "er" : ""} i liste`
          : "Legg til i booking-liste"}
      </Button>
    </div>
  );
}
