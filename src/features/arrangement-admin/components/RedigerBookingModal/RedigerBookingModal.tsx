import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatoVelger from "@/components/DatoVelger";

import type { BaneRespons } from "@/types";
import { genererTidspunkter } from "../../views/arrangement/arrangementUtils";
import type { LokalBooking } from "../../types";

export type RedigerBookingVerdier = {
  dato: string;
  startTid: string;
  sluttTid: string;
  baneId: string;
  baneNavn: string;
};

type Props = {
  /** Booking som redigeres – null betyr lukket modal. */
  booking: LokalBooking | null;
  baner: BaneRespons[];
  onBekreft: (id: string, verdier: RedigerBookingVerdier) => void;
  onAvbryt: () => void;
};

function getSlotLengde(bane: BaneRespons): number {
  return bane.bookingOverstyring?.slotLengdeMinutter ?? bane.bookingInnstillinger.slotLengdeMinutter;
}

function leggTilMinutter(tid: string, minutter: number): string {
  const [h, m] = tid.split(":").map(Number);
  const total = h * 60 + m + minutter;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function datoTekstTilDate(s: string): Date {
  const [y, mo, d] = s.split("-").map(Number);
  return new Date(y, mo - 1, d);
}

function dateTilTekst(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Remountes via key={bookingId} når en ny booking velges for redigering.
 * Bruker lazy useState-initializers fra booking-propen – ingen render-fase setState.
 */
export default function RedigerBookingModal({ booking, baner, onBekreft, onAvbryt }: Props) {
  const [dato, setDato] = useState<Date>(() =>
    booking ? datoTekstTilDate(booking.dato) : new Date()
  );
  const [valgtBaneId, setValgtBaneId] = useState<string>(() => booking?.baneId ?? "");
  const [valgtStartTid, setValgtStartTid] = useState<string>(() => booking?.startTid ?? "");

  const valgtBane = baner.find((b) => b.id === valgtBaneId);
  const slotLengde = valgtBane ? getSlotLengde(valgtBane) : 60;

  const tidspunkter = valgtBane
    ? genererTidspunkter(
        valgtBane.bookingInnstillinger.aapningstid || "08:00",
        valgtBane.bookingInnstillinger.stengetid || "22:00",
        slotLengde
      )
    : [];

  const sluttTid = valgtStartTid ? leggTilMinutter(valgtStartTid, slotLengde) : "";

  const kanBekrefte = !!dato && !!valgtBaneId && !!valgtStartTid;

  const håndterBaneEndring = (baneId: string) => {
    setValgtBaneId(baneId);
    setValgtStartTid("");
  };

  const håndterBekreft = () => {
    if (!booking || !kanBekrefte || !valgtBane) return;
    onBekreft(booking.id, {
      dato: dateTilTekst(dato),
      startTid: valgtStartTid,
      sluttTid,
      baneId: valgtBaneId,
      baneNavn: valgtBane.navn,
    });
  };

  return (
    <Dialog open={!!booking} onOpenChange={(open) => !open && onAvbryt()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rediger booking</DialogTitle>
          <DialogDescription className="sr-only">
            Endre dato, bane og tidspunkt for bookingen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Dato */}
          <div className="space-y-1.5">
            <Label htmlFor="rediger-dato">Dato</Label>
            <DatoVelger value={dato} onChange={setDato} visNavigering />
          </div>

          {/* Bane */}
          <div className="space-y-1.5">
            <Label htmlFor="rediger-bane">Bane</Label>
            <Select value={valgtBaneId} onValueChange={håndterBaneEndring}>
              <SelectTrigger id="rediger-bane">
                <SelectValue placeholder="Velg bane…" />
              </SelectTrigger>
              <SelectContent>
                {baner.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.navn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* StartTid */}
          <div className="space-y-1.5">
            <Label htmlFor="rediger-starttid">Starttidspunkt</Label>
            <Select value={valgtStartTid} onValueChange={setValgtStartTid} disabled={!valgtBaneId}>
              <SelectTrigger id="rediger-starttid">
                <SelectValue placeholder="Velg tidspunkt…" />
              </SelectTrigger>
              <SelectContent>
                {tidspunkter.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* SluttTid (beregnet, read-only) */}
          {sluttTid && (
            <p className="text-sm text-muted-foreground">
              Sluttid: <span className="font-medium text-foreground">{sluttTid}</span>
              {" "}({slotLengde} min)
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onAvbryt}>
            Avbryt
          </Button>
          <Button type="button" disabled={!kanBekrefte} onClick={håndterBekreft}>
            Lagre endring
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
