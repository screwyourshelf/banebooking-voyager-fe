import { useMemo, useState } from "react";
import {
  AdminFormActions,
  SettingsChoiceGroup,
  SettingsPanel,
  SettingsRow,
  SettingsSwitchRow,
} from "@/components/admin";
import DatoVelger from "@/components/DatoVelger";
import { RecordStatus } from "@/components/records";
import { Button } from "@/components/ui/button";
import type { BaneRespons, DayOfWeek } from "@/types";
import { dayOfWeekKortNorsk } from "@/utils/datoUtils";
import type { LokalBooking } from "../../types";
import {
  beregnTidspunkterForBaner,
  finnTilgjengeligeUkedager,
  genererLokalBookinger,
  grupperBanerEtterSlotLengde,
  type SlotLengdeGruppe,
} from "../../views/arrangement/arrangementUtils";

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
  set((current) =>
    current.includes(item) ? current.filter((value) => value !== item) : [...current, item]
  );
}

export default function GjentakendeOppsett({ baner, onGenerer }: Props) {
  const [datoFra, setDatoFra] = useState<Date>(new Date());
  const [datoTil, setDatoTil] = useState<Date>(new Date());
  const [valgteBaner, setValgteBaner] = useState<string[]>([]);
  const [valgteUkedager, setValgteUkedager] = useState<DayOfWeek[]>([]);
  const [alleBaner, setAlleBaner] = useState(false);
  const [alleUkedager, setAlleUkedager] = useState(false);
  const [tidspunkterPerGruppe, setTidspunkterPerGruppe] = useState<Record<number, string[]>>({});
  const [allePerGruppe, setAllePerGruppe] = useState<Record<number, boolean>>({});
  const [valgteTidspunkter, setValgteTidspunkter] = useState<string[]>([]);
  const [alleTidspunkter, setAlleTidspunkter] = useState(false);

  const tilgjengeligeUkedager = useMemo(
    () => finnTilgjengeligeUkedager(datoFra, datoTil),
    [datoFra, datoTil]
  );
  const [prevTilgjengeligeUkedager, setPrevTilgjengeligeUkedager] = useState(tilgjengeligeUkedager);
  if (tilgjengeligeUkedager !== prevTilgjengeligeUkedager) {
    setPrevTilgjengeligeUkedager(tilgjengeligeUkedager);
    setValgteUkedager((current) => current.filter((day) => tilgjengeligeUkedager.includes(day)));
  }

  // Behold samme array-identitet mellom renders. Slot-gruppene synkroniserer
  // avhengig state når baneutvalget faktisk endres; en ny map()-array på hver
  // render fikk ellers "Alle baner" til å utløse en uendelig renderløkke.
  const alleBaneIder = useMemo(() => baner.map((bane) => bane.id), [baner]);
  const aktiveBaner = alleBaner ? alleBaneIder : valgteBaner;
  const slotGrupper = useMemo(
    () => grupperBanerEtterSlotLengde(baner, aktiveBaner),
    [baner, aktiveBaner]
  );
  const erGruppert = slotGrupper.length > 1;
  const tidspunktResultat = useMemo(
    () => beregnTidspunkterForBaner(baner, aktiveBaner),
    [baner, aktiveBaner]
  );

  const [prevSlotGrupper, setPrevSlotGrupper] = useState(slotGrupper);
  if (slotGrupper !== prevSlotGrupper) {
    setPrevSlotGrupper(slotGrupper);
    if (erGruppert) {
      setTidspunkterPerGruppe((current) => {
        const next: Record<number, string[]> = {};
        for (const group of slotGrupper) {
          next[group.slotLengdeMinutter] = (current[group.slotLengdeMinutter] ?? []).filter(
            (time) => group.tidspunkter.includes(time)
          );
        }
        return next;
      });
      setAllePerGruppe((current) => {
        const next: Record<number, boolean> = {};
        for (const group of slotGrupper) {
          next[group.slotLengdeMinutter] = current[group.slotLengdeMinutter] ?? false;
        }
        return next;
      });
    }
  }

  const [prevAllePerGruppe, setPrevAllePerGruppe] = useState(allePerGruppe);
  if (allePerGruppe !== prevAllePerGruppe) {
    setPrevAllePerGruppe(allePerGruppe);
    if (erGruppert) {
      setTidspunkterPerGruppe((current) => {
        const next = { ...current };
        for (const group of slotGrupper) {
          if (allePerGruppe[group.slotLengdeMinutter]) {
            next[group.slotLengdeMinutter] = group.tidspunkter;
          }
        }
        return next;
      });
    }
  }

  const tilgjengeligeTidspunkter = tidspunktResultat.tidspunkter;
  const [prevTilgjengeligeTidspunkter, setPrevTilgjengeligeTidspunkter] =
    useState(tilgjengeligeTidspunkter);
  if (tilgjengeligeTidspunkter !== prevTilgjengeligeTidspunkter) {
    setPrevTilgjengeligeTidspunkter(tilgjengeligeTidspunkter);
    if (!erGruppert) {
      setValgteTidspunkter((current) =>
        current.filter((time) => tilgjengeligeTidspunkter.includes(time))
      );
    }
  }

  const effektivTidspunkterPerGruppe: Record<number, string[]> = erGruppert
    ? tidspunkterPerGruppe
    : slotGrupper.length === 1
      ? {
          [slotGrupper[0].slotLengdeMinutter]: alleTidspunkter
            ? tilgjengeligeTidspunkter
            : valgteTidspunkter,
        }
      : {};
  const kanGenerere =
    aktiveBaner.length > 0 &&
    (alleUkedager || valgteUkedager.length > 0) &&
    (erGruppert
      ? slotGrupper.some(
          (group: SlotLengdeGruppe) =>
            allePerGruppe[group.slotLengdeMinutter] ||
            (tidspunkterPerGruppe[group.slotLengdeMinutter] ?? []).length > 0
        )
      : alleTidspunkter || valgteTidspunkter.length > 0);

  const handleGenerate = () => {
    const aktiveUkedager = alleUkedager ? tilgjengeligeUkedager : valgteUkedager;
    onGenerer(
      genererLokalBookinger({
        datoFra,
        datoTil,
        valgteUkedager: aktiveUkedager,
        slotGrupper,
        tidspunkterPerGruppe: effektivTidspunkterPerGruppe,
      })
    );
  };

  return (
    <>
      <SettingsPanel>
        <SettingsRow title="Fra dato">
          <DatoVelger value={datoFra} onChange={setDatoFra} visNavigering />
        </SettingsRow>
        <SettingsRow title="Til dato">
          <DatoVelger value={datoTil} onChange={setDatoTil} visNavigering />
        </SettingsRow>

        <SettingsSwitchRow
          title="Alle ukedager i perioden"
          description="Bruk alle dager som finnes mellom fra- og til-dato."
          checked={alleUkedager}
          onCheckedChange={setAlleUkedager}
        />
        <SettingsRow title="Ukedager" description="Velg dagene som skal gjentas.">
          <SettingsChoiceGroup
            label="Ukedager"
            options={UKEDAGER_REKKEFOLGE.map((day) => ({
              value: day,
              label: dayOfWeekKortNorsk(day),
              disabled: !tilgjengeligeUkedager.includes(day),
            }))}
            selectedValues={alleUkedager ? tilgjengeligeUkedager : valgteUkedager}
            onToggle={(value) => toggleItem(value as DayOfWeek, setValgteUkedager)}
            disabled={alleUkedager}
          />
        </SettingsRow>

        <SettingsSwitchRow
          title="Alle baner"
          description="Bruk alle banene i valgt gren."
          checked={alleBaner}
          onCheckedChange={setAlleBaner}
        />
        <SettingsRow title="Baner" description="Velg banene arrangementet skal bruke.">
          <SettingsChoiceGroup
            label="Baner"
            options={baner.map((bane) => ({ value: bane.id, label: bane.navn }))}
            selectedValues={aktiveBaner}
            onToggle={(value) => toggleItem(value, setValgteBaner)}
            disabled={alleBaner}
          />
        </SettingsRow>

        {tidspunktResultat.advarselTekst ? (
          <SettingsRow title="Ulik varighet" description={tidspunktResultat.advarselTekst}>
            <RecordStatus tone="warning">Kontroller tidene</RecordStatus>
          </SettingsRow>
        ) : null}

        {erGruppert ? (
          slotGrupper.flatMap((group) => {
            const slotLength = group.slotLengdeMinutter;
            const allTimes = allePerGruppe[slotLength] ?? false;
            const selectedTimes = tidspunkterPerGruppe[slotLength] ?? [];
            return [
              <SettingsSwitchRow
                key={`all-${slotLength}`}
                title={`Alle tidspunkter · ${slotLength} min`}
                description={group.baneNavn.join(", ")}
                checked={allTimes}
                onCheckedChange={(checked) =>
                  setAllePerGruppe((current) => ({ ...current, [slotLength]: checked }))
                }
              />,
              <SettingsRow
                key={`times-${slotLength}`}
                title={`Tidspunkter · ${slotLength} min`}
                description={group.baneNavn.join(", ")}
              >
                <SettingsChoiceGroup
                  label={`Tidspunkter for ${slotLength} minutter`}
                  options={group.tidspunkter.map((time) => ({ value: time, label: time }))}
                  selectedValues={allTimes ? group.tidspunkter : selectedTimes}
                  onToggle={(value) =>
                    setTidspunkterPerGruppe((current) => ({
                      ...current,
                      [slotLength]: selectedTimes.includes(value)
                        ? selectedTimes.filter((time) => time !== value)
                        : [...selectedTimes, value],
                    }))
                  }
                  disabled={allTimes}
                />
              </SettingsRow>,
            ];
          })
        ) : (
          <>
            <SettingsSwitchRow
              title="Alle tidspunkter"
              description="Bruk alle tilgjengelige starttider for valgte baner."
              checked={alleTidspunkter}
              onCheckedChange={setAlleTidspunkter}
            />
            <SettingsRow title="Tidspunkter" description="Velg starttidene som skal gjentas.">
              <SettingsChoiceGroup
                label="Tidspunkter"
                options={tilgjengeligeTidspunkter.map((time) => ({ value: time, label: time }))}
                selectedValues={alleTidspunkter ? tilgjengeligeTidspunkter : valgteTidspunkter}
                onToggle={(value) => toggleItem(value, setValgteTidspunkter)}
                disabled={alleTidspunkter}
              />
            </SettingsRow>
          </>
        )}
      </SettingsPanel>

      <AdminFormActions>
        <Button type="button" disabled={!kanGenerere} onClick={handleGenerate}>
          Legg forslag i listen
        </Button>
      </AdminFormActions>
    </>
  );
}
