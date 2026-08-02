import { useState } from "react";
import {
  AdminEditorDialog,
  AdminFormActions,
  AdminSettingsForm,
  SettingsPanel,
  SettingsRow,
  SettingsSection,
  SettingsStack,
  SettingsValue,
} from "@/components/admin";
import DatoVelger from "@/components/DatoVelger";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BaneRespons } from "@/types";
import type { LokalBooking } from "../../types";
import { genererTidspunkter } from "../../views/arrangement/arrangementUtils";

export type RedigerBookingVerdier = {
  dato: string;
  startTid: string;
  sluttTid: string;
  baneId: string;
  baneNavn: string;
};

type Props = {
  booking: LokalBooking | null;
  baner: BaneRespons[];
  onBekreft: (id: string, verdier: RedigerBookingVerdier) => void;
  onAvbryt: () => void;
};

function getSlotLength(court: BaneRespons): number {
  return (
    court.bookingOverstyring?.slotLengdeMinutter ?? court.bookingInnstillinger.slotLengdeMinutter
  );
}

function addMinutes(time: string, minutes: number): string {
  const [hours, currentMinutes] = time.split(":").map(Number);
  const total = hours * 60 + currentMinutes + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function toDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateText(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function RedigerBookingModal({ booking, baner, onBekreft, onAvbryt }: Props) {
  const [dato, setDato] = useState<Date>(() => (booking ? toDate(booking.dato) : new Date()));
  const [valgtBaneId, setValgtBaneId] = useState(() => booking?.baneId ?? "");
  const [valgtStartTid, setValgtStartTid] = useState(() => booking?.startTid ?? "");
  const valgtBane = baner.find((bane) => bane.id === valgtBaneId);
  const slotLengde = valgtBane ? getSlotLength(valgtBane) : 60;
  const tidspunkter = valgtBane
    ? genererTidspunkter(
        valgtBane.bookingInnstillinger.aapningstid || "08:00",
        valgtBane.bookingInnstillinger.stengetid || "22:00",
        slotLengde
      )
    : [];
  const sluttTid = valgtStartTid ? addMinutes(valgtStartTid, slotLengde) : "";
  const kanBekrefte = !!dato && !!valgtBaneId && !!valgtStartTid;

  const handleCourtChange = (courtId: string) => {
    setValgtBaneId(courtId);
    setValgtStartTid("");
  };

  const handleSubmit = () => {
    if (!booking || !valgtBane || !kanBekrefte) return;
    onBekreft(booking.id, {
      dato: toDateText(dato),
      startTid: valgtStartTid,
      sluttTid,
      baneId: valgtBaneId,
      baneNavn: valgtBane.navn,
    });
  };

  return (
    <AdminEditorDialog
      open={!!booking}
      onOpenChange={(open) => !open && onAvbryt()}
      backLabel="Til listen"
      eyebrow="Banetid"
      title="Rediger banetid"
      description="Endre dato, bane eller starttid."
    >
      <AdminSettingsForm
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <SettingsStack>
          <SettingsSection
            title="Tid og bane"
            description="Sluttiden beregnes ut fra banens varighet."
          >
            <SettingsPanel>
              <SettingsRow title="Dato">
                <DatoVelger value={dato} onChange={setDato} visNavigering />
              </SettingsRow>

              <SettingsRow title="Bane">
                <Field>
                  <Select value={valgtBaneId} onValueChange={handleCourtChange}>
                    <SelectTrigger id="rediger-bane">
                      <SelectValue placeholder="Velg bane…" />
                    </SelectTrigger>
                    <SelectContent>
                      {baner.map((bane) => (
                        <SelectItem key={bane.id} value={bane.id}>
                          {bane.navn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </SettingsRow>

              <SettingsRow title="Starttid">
                <Field>
                  <Select
                    value={valgtStartTid}
                    onValueChange={setValgtStartTid}
                    disabled={!valgtBaneId}
                  >
                    <SelectTrigger id="rediger-starttid">
                      <SelectValue placeholder="Velg tidspunkt…" />
                    </SelectTrigger>
                    <SelectContent>
                      {tidspunkter.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </SettingsRow>

              {sluttTid ? (
                <SettingsRow title="Sluttid" description={`${slotLengde} minutter`}>
                  <SettingsValue>{sluttTid}</SettingsValue>
                </SettingsRow>
              ) : null}
            </SettingsPanel>
          </SettingsSection>
        </SettingsStack>

        <AdminFormActions>
          <Button type="button" variant="outline" onClick={onAvbryt}>
            Avbryt
          </Button>
          <Button type="submit" disabled={!kanBekrefte}>
            Lagre endring
          </Button>
        </AdminFormActions>
      </AdminSettingsForm>
    </AdminEditorDialog>
  );
}
