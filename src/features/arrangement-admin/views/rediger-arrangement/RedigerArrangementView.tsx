import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { FormSkeleton } from "@/components/loading";
import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row } from "@/components/rows";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAktiveArrangementer } from "@/features/booking/hooks/useAktiveArrangementer";
import { useRedigerArrangement } from "../../hooks/useRedigerArrangement";
import { useAvlysArrangement } from "../../hooks/useAvlysArrangement";
import { SlettArrangementDialog } from "../../components";
import ArrangementContent from "../arrangement/ArrangementContent";
import { byggDto, finnTilgjengeligeUkedager } from "../arrangement/arrangementUtils";

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

function parseDatoString(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default function RedigerArrangementView() {
  const [valgtId, setValgtId] = useState<string>("");

  const { data: arrangementer, isLoading: loadingArrangementer } = useAktiveArrangementer(true);

  const {
    arrangement,
    baner,
    tilgjengeligeTidspunkter,
    forhandsvisning,
    forhandsvis,
    clearForhandsvisning,
    erstatt,
    isLoading,
    isLoadingArrangement,
    isLoadingForhandsvisning,
  } = useRedigerArrangement(valgtId || null);

  const { avlys } = useAvlysArrangement();

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
  const [prefyltId, setPrefyltId] = useState<string | null>(null);

  // Pre-fyll skjema når arrangementdata lastes
  useEffect(() => {
    if (!arrangement) {
      setPrefyltId(null);
      return;
    }
    setKategori(arrangement.kategori);
    setBeskrivelse(arrangement.beskrivelse ?? "");
    setTillaterPaamelding(arrangement.tillaterPaamelding);
    setDatoFra(parseDatoString(arrangement.startDato));
    setDatoTil(parseDatoString(arrangement.sluttDato));
    setValgteBaner(arrangement.baneIder);
    setValgteUkedager(arrangement.ukedager);
    setValgteTidspunkter(arrangement.tidspunkter);
    setAlleBaner(false);
    setAlleUkedager(false);
    setAlleTidspunkter(false);
    setPrefyltId(arrangement.id);
  }, [arrangement]);

  const tilgjengeligeUkedager = useMemo(
    () => finnTilgjengeligeUkedager(datoFra, datoTil),
    [datoFra, datoTil]
  );

  useEffect(() => {
    if (alleBaner) setValgteBaner(baner.map((b) => b.id));
  }, [alleBaner, baner]);

  useEffect(() => {
    if (alleUkedager) setValgteUkedager(tilgjengeligeUkedager);
  }, [alleUkedager, tilgjengeligeUkedager]);

  useEffect(() => {
    if (alleTidspunkter) setValgteTidspunkter(tilgjengeligeTidspunkter);
  }, [alleTidspunkter, tilgjengeligeTidspunkter]);

  useEffect(() => {
    setValgteUkedager((prev) => prev.filter((d) => tilgjengeligeUkedager.includes(d)));
  }, [tilgjengeligeUkedager]);

  const dtoOrNull = () =>
    byggDto({
      datoFra,
      datoTil,
      valgteBaner,
      valgteUkedager,
      valgteTidspunkter,
      kategori,
      beskrivelse,
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
    await erstatt(dto);
    clearForhandsvisning();
    setDialogOpen(false);
  };

  const skalFjernePaameldte =
    (arrangement?.tillaterPaamelding ?? false) &&
    !tillaterPaamelding &&
    (arrangement?.antallPaameldte ?? 0) > 0;

  const advarsel = skalFjernePaameldte
    ? `${arrangement!.antallPaameldte} påmelding(er) vil bli fjernet.`
    : undefined;

  return (
    <>
      <PageSection title="Velg arrangement" description="Velg arrangementet du vil redigere.">
        <RowPanel>
          <RowList>
            <Row title="Arrangement" description="Velg et aktivt arrangement.">
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <Field>
                    <Label htmlFor="velg-arrangement" className="sr-only">
                      Arrangement
                    </Label>

                    <Select
                      value={valgtId}
                      onValueChange={setValgtId}
                      disabled={loadingArrangementer}
                    >
                      <SelectTrigger id="velg-arrangement">
                        <SelectValue
                          placeholder={
                            loadingArrangementer ? "Henter arrangementer…" : "Velg arrangement…"
                          }
                        />
                      </SelectTrigger>

                      <SelectContent>
                        {arrangementer?.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.tittel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                {arrangement && prefyltId === arrangement.id && (
                  <SlettArrangementDialog
                    tittel={arrangement.tittel}
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

      {valgtId &&
        (isLoading || isLoadingArrangement || (!!arrangement && prefyltId !== arrangement.id)) && (
          <FormSkeleton />
        )}

      {valgtId &&
        !isLoading &&
        !isLoadingArrangement &&
        arrangement &&
        prefyltId === arrangement.id && (
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
            onCreate={håndterOppdater}
            onDialogOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) clearForhandsvisning();
            }}
            bekreftTekst={`Oppdater ${forhandsvisning.ledige.length} bookinger`}
            advarsel={advarsel}
          />
        )}
    </>
  );
}
