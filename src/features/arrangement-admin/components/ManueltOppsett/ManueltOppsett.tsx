import { useMemo, useState } from "react";
import { Form, Settings } from "@/components";

import DatoFlervelger from "@/components/DatoFlervelger";
import { RecordStatus } from "@/components/records";
import { Button } from "@/components/ui/button";
import type { BaneRespons } from "@/types";
import { tilDatoTekst } from "@/utils/datoUtils";
import type { LokalBooking } from "../../types";
import { formaterAntallBanetider } from "@/utils/arrangementPresentation";
import { lagLokalBookingId } from "../BookingListe/bookingListeUtils";
import {
  beregnTidspunkterForBaner,
  grupperBanerEtterSlotLengde,
  type SlotLengdeGruppe,
} from "../../views/arrangement/arrangementUtils";

type Props = {
  baner: BaneRespons[];
  onLeggTil: (bookinger: LokalBooking[]) => void;
};

function addMinutes(time: string, minutes: number): string {
  const [hours, currentMinutes] = time.split(":").map(Number);
  const total = hours * 60 + currentMinutes + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function generateBookings(
  dates: Date[],
  groups: SlotLengdeGruppe[],
  timesByGroup: Record<number, string[]>
): LokalBooking[] {
  const bookings: LokalBooking[] = [];
  for (const date of dates) {
    const dateText = tilDatoTekst(date);
    for (const group of groups) {
      for (const startTime of timesByGroup[group.slotLengdeMinutter] ?? []) {
        const endTime = addMinutes(startTime, group.slotLengdeMinutter);
        for (let index = 0; index < group.baneIder.length; index++) {
          bookings.push({
            id: lagLokalBookingId(),
            dato: dateText,
            startTid: startTime,
            sluttTid: endTime,
            baneId: group.baneIder[index],
            baneNavn: group.baneNavn[index],
            status: "ukjent",
            kilde: "manuell",
          });
        }
      }
    }
  }
  return bookings;
}

function toggleItem<T>(item: T, set: React.Dispatch<React.SetStateAction<T[]>>) {
  set((current) =>
    current.includes(item) ? current.filter((value) => value !== item) : [...current, item]
  );
}

export default function ManueltOppsett({ baner, onLeggTil }: Props) {
  const [valgteDataer, setValgteDataer] = useState<Date[]>([]);
  const [valgteBaneIder, setValgteBaneIder] = useState<string[]>([]);
  const [tidspunkterPerGruppe, setTidspunkterPerGruppe] = useState<Record<number, string[]>>({});
  const [allePerGruppe, setAllePerGruppe] = useState<Record<number, boolean>>({});
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
    slotGrupper.reduce(
      (total, group) =>
        total +
        group.baneIder.length *
          (effektivTidspunkterPerGruppe[group.slotLengdeMinutter] ?? []).length,
      0
    );
  const kanLeggeTil =
    valgteDataer.length > 0 &&
    valgteBaneIder.length > 0 &&
    (erGruppert
      ? slotGrupper.some(
          (group: SlotLengdeGruppe) =>
            allePerGruppe[group.slotLengdeMinutter] ||
            (tidspunkterPerGruppe[group.slotLengdeMinutter] ?? []).length > 0
        )
      : alleTidspunkter || valgteTidspunkter.length > 0);

  const requirements = [
    valgteDataer.length === 0 ? "minst én dato" : null,
    valgteBaneIder.length === 0 ? "minst én bane" : null,
    valgteBaneIder.length > 0 && !alleTidspunkter && valgteTidspunkter.length === 0 && !erGruppert
      ? "minst ett tidspunkt"
      : null,
    valgteBaneIder.length > 0 &&
    erGruppert &&
    !slotGrupper.some(
      (group) =>
        allePerGruppe[group.slotLengdeMinutter] ||
        (tidspunkterPerGruppe[group.slotLengdeMinutter] ?? []).length > 0
    )
      ? "minst ett tidspunkt"
      : null,
  ].filter(Boolean);

  const handleAdd = () => {
    if (!kanLeggeTil) return;
    onLeggTil(generateBookings(valgteDataer, slotGrupper, effektivTidspunkterPerGruppe));
    setValgteDataer([]);
  };

  return (
    <>
      <Form.Fields>
        <Form.Field label="Datoer" description="Velg én eller flere datoer i kalenderen.">
          <DatoFlervelger
            value={valgteDataer}
            onChange={setValgteDataer}
            ariaLabel="Velg datoer for bookingene"
          />
          <Settings.Text>
            {valgteDataer.length === 0
              ? "Ingen datoer valgt."
              : `${valgteDataer.length} dato${valgteDataer.length === 1 ? "" : "er"} valgt.`}
          </Settings.Text>
        </Form.Field>

        <Form.Field label="Baner" description="Velg én eller flere baner.">
          <Settings.ChoiceGroup
            label="Baner"
            options={baner.map((bane) => ({ value: bane.id, label: bane.navn }))}
            selectedValues={valgteBaneIder}
            onToggle={(value) => toggleItem(value, setValgteBaneIder)}
          />
        </Form.Field>

        {tidspunktResultat.advarselTekst ? (
          <Settings.Row title="Ulik varighet" description={tidspunktResultat.advarselTekst}>
            <RecordStatus tone="warning">Kontroller tidene</RecordStatus>
          </Settings.Row>
        ) : null}

        {erGruppert ? (
          slotGrupper.flatMap((group) => {
            const slotLength = group.slotLengdeMinutter;
            const allTimes = allePerGruppe[slotLength] ?? false;
            const selectedTimes = tidspunkterPerGruppe[slotLength] ?? [];
            return [
              <Settings.SwitchRow
                key={`all-${slotLength}`}
                title={`Alle tidspunkter · ${slotLength} min`}
                description={group.baneNavn.join(", ")}
                checked={allTimes}
                onCheckedChange={(checked) =>
                  setAllePerGruppe((current) => ({ ...current, [slotLength]: checked }))
                }
              />,
              <Form.Field
                key={`times-${slotLength}`}
                label={`Tidspunkter · ${slotLength} min`}
                description={group.baneNavn.join(", ")}
              >
                <Settings.ChoiceGroup
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
              </Form.Field>,
            ];
          })
        ) : valgteBaneIder.length > 0 ? (
          <>
            <Settings.SwitchRow
              title="Alle tidspunkter"
              description="Bruk alle tilgjengelige starttider for valgte baner."
              checked={alleTidspunkter}
              onCheckedChange={setAlleTidspunkter}
            />
            <Form.Field label="Tidspunkter" description="Velg starttidene som skal legges til.">
              <Settings.ChoiceGroup
                label="Tidspunkter"
                options={tilgjengeligeTidspunkter.map((time) => ({ value: time, label: time }))}
                selectedValues={alleTidspunkter ? tilgjengeligeTidspunkter : valgteTidspunkter}
                onToggle={(value) => toggleItem(value, setValgteTidspunkter)}
                disabled={alleTidspunkter}
              />
            </Form.Field>
          </>
        ) : null}

        <Settings.Row title={kanLeggeTil ? "Klart til å legge til" : "Før du kan legge til"}>
          <Settings.Text>
            {kanLeggeTil
              ? `${formaterAntallBanetider(antallBookinger)} legges i listen.`
              : `Velg ${requirements.join(", ")}.`}
          </Settings.Text>
        </Settings.Row>
      </Form.Fields>

      <Form.Actions>
        <Button type="button" disabled={!kanLeggeTil} onClick={handleAdd}>
          {kanLeggeTil
            ? `Legg til ${formaterAntallBanetider(antallBookinger)}`
            : "Legg til i listen"}
        </Button>
      </Form.Actions>
    </>
  );
}
