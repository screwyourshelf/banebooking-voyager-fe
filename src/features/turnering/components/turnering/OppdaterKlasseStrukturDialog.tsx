import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OppdaterKlasseStrukturForespørsel, TurneringKlasseRespons, TurneringStruktur } from "@/types";
import { ServerFeil } from "@/components/errors";
import { klasseTypeNavn } from "../draw/klasseTypeUtils";

const STRUKTUR_LABELS: Record<TurneringStruktur, string> = {
  RoundRobin: "Round Robin",
  GruppeMedSluttspill: "Gruppe + sluttspill",
  Utslagning: "Utslagning",
};

type KampFormatState = {
  antallSett: number;
  spillTil: number;
  superTiebreak: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  klasse: TurneringKlasseRespons;
  onOppdater: (payload: OppdaterKlasseStrukturForespørsel) => void;
  isPending: boolean;
  serverFeil?: string | null;
};

export function OppdaterKlasseStrukturDialog({
  open,
  onOpenChange,
  klasse,
  onOppdater,
  isPending,
  serverFeil,
}: Props) {
  const [struktur, setStruktur] = useState<TurneringStruktur>(klasse.struktur);
  const [sluttspillFormat, setSluttspillFormat] = useState<KampFormatState>(
    klasse.sluttspillKampFormat
  );
  const [gruppespillFormat, setGruppespillFormat] = useState<KampFormatState>(
    klasse.gruppespillKampFormat ?? { antallSett: 3, spillTil: 6, superTiebreak: false }
  );

  function handleOppdater() {
    onOppdater({
      struktur,
      sluttspillKampFormat: sluttspillFormat,
      ...(struktur === "GruppeMedSluttspill" && { gruppespillKampFormat: gruppespillFormat }),
    });
  }

  function handleClose(v: boolean) {
    if (!v) {
      setStruktur(klasse.struktur);
      setSluttspillFormat(klasse.sluttspillKampFormat);
      setGruppespillFormat(
        klasse.gruppespillKampFormat ?? { antallSett: 3, spillTil: 6, superTiebreak: false }
      );
    }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rediger klasse – {klasseTypeNavn(klasse.klasseType)}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Struktur</Label>
            <Select value={struktur} onValueChange={(v) => setStruktur(v as TurneringStruktur)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STRUKTUR_LABELS) as TurneringStruktur[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {STRUKTUR_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {struktur === "GruppeMedSluttspill" && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Gruppespill-format</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Antall sett</Label>
                  <Select
                    value={String(gruppespillFormat.antallSett)}
                    onValueChange={(v) =>
                      setGruppespillFormat({ ...gruppespillFormat, antallSett: Number(v) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 sett</SelectItem>
                      <SelectItem value="3">Best av 3</SelectItem>
                      <SelectItem value="5">Best av 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Spill til</Label>
                  <Select
                    value={String(gruppespillFormat.spillTil)}
                    onValueChange={(v) =>
                      setGruppespillFormat({ ...gruppespillFormat, spillTil: Number(v) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 games</SelectItem>
                      <SelectItem value="6">6 games</SelectItem>
                      <SelectItem value="8">8 games</SelectItem>
                      <SelectItem value="10">10 games</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="gruppespill-tiebreak"
                  checked={gruppespillFormat.superTiebreak}
                  onCheckedChange={(v) =>
                    setGruppespillFormat({ ...gruppespillFormat, superTiebreak: v })
                  }
                  disabled={gruppespillFormat.antallSett === 1}
                />
                <Label htmlFor="gruppespill-tiebreak" className="text-sm font-normal">
                  Super-tiebreak (siste sett)
                </Label>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm font-medium">
              {struktur === "GruppeMedSluttspill" ? "Sluttspill-format" : "Format"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Antall sett</Label>
                <Select
                  value={String(sluttspillFormat.antallSett)}
                  onValueChange={(v) =>
                    setSluttspillFormat({ ...sluttspillFormat, antallSett: Number(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 sett</SelectItem>
                    <SelectItem value="3">Best av 3</SelectItem>
                    <SelectItem value="5">Best av 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Spill til</Label>
                <Select
                  value={String(sluttspillFormat.spillTil)}
                  onValueChange={(v) =>
                    setSluttspillFormat({ ...sluttspillFormat, spillTil: Number(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 games</SelectItem>
                    <SelectItem value="6">6 games</SelectItem>
                    <SelectItem value="8">8 games</SelectItem>
                    <SelectItem value="10">10 games</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="sluttspill-tiebreak"
                checked={sluttspillFormat.superTiebreak}
                onCheckedChange={(v) =>
                  setSluttspillFormat({ ...sluttspillFormat, superTiebreak: v })
                }
                disabled={sluttspillFormat.antallSett === 1}
              />
              <Label htmlFor="sluttspill-tiebreak" className="text-sm font-normal">
                Super-tiebreak (siste sett)
              </Label>
            </div>
          </div>

          <ServerFeil feil={serverFeil ?? null} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
              Avbryt
            </Button>
            <Button onClick={handleOppdater} disabled={isPending}>
              {isPending ? "Lagrer..." : "Lagre endringer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
