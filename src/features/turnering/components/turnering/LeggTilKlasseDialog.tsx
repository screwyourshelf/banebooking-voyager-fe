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
import type { KlasseType, LeggTilKlasseForespørsel, TurneringStruktur } from "@/types";
import { ServerFeil } from "@/components/errors";

const KLASSE_TYPER: KlasseType[] = [
  "HerreSingle",
  "DameSingle",
  "HerreDobbel",
  "DameDobbel",
  "MixedDobbel",
  "JuniorSingle",
  "JuniorDobbel",
];

const KLASSE_LABELS: Record<KlasseType, string> = {
  HerreSingle: "Herre single",
  DameSingle: "Dame single",
  HerreDobbel: "Herre dobbel",
  DameDobbel: "Dame dobbel",
  MixedDobbel: "Mixed dobbel",
  JuniorSingle: "Junior single",
  JuniorDobbel: "Junior dobbel",
};

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

const DEFAULT_SLUTTSPILL_FORMAT: KampFormatState = {
  antallSett: 3,
  spillTil: 6,
  superTiebreak: true,
};

const DEFAULT_GRUPPESPILL_FORMAT: KampFormatState = {
  antallSett: 3,
  spillTil: 6,
  superTiebreak: false,
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eksisterendeKlasser: KlasseType[];
  onLeggTil: (payload: LeggTilKlasseForespørsel) => void;
  isPending: boolean;
  serverFeil?: string | null;
};

export function LeggTilKlasseDialog({
  open,
  onOpenChange,
  eksisterendeKlasser,
  onLeggTil,
  isPending,
  serverFeil,
}: Props) {
  const tilgjengelige = KLASSE_TYPER.filter((k) => !eksisterendeKlasser.includes(k));
  const [klasseType, setKlasseType] = useState<KlasseType | "">(tilgjengelige[0] ?? "");
  const [struktur, setStruktur] = useState<TurneringStruktur>("GruppeMedSluttspill");
  const [sluttspillFormat, setSluttspillFormat] =
    useState<KampFormatState>(DEFAULT_SLUTTSPILL_FORMAT);
  const [gruppespillFormat, setGruppespillFormat] = useState<KampFormatState>(
    DEFAULT_GRUPPESPILL_FORMAT
  );

  function handleLeggTil() {
    if (!klasseType) return;
    onLeggTil({
      klasseType,
      struktur,
      sluttspillKampFormat: sluttspillFormat,
      ...(struktur === "GruppeMedSluttspill" && { gruppespillKampFormat: gruppespillFormat }),
      autoGodkjenn: true,
    });
  }

  function handleClose(v: boolean) {
    if (!v) {
      setKlasseType(tilgjengelige[0] ?? "");
      setStruktur("GruppeMedSluttspill");
      setSluttspillFormat(DEFAULT_SLUTTSPILL_FORMAT);
      setGruppespillFormat(DEFAULT_GRUPPESPILL_FORMAT);
    }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Legg til klasse</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Klasse</Label>
            <Select
              value={klasseType}
              onValueChange={(v) => setKlasseType(v as KlasseType)}
              disabled={tilgjengelige.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg klasse" />
              </SelectTrigger>
              <SelectContent>
                {tilgjengelige.map((k) => (
                  <SelectItem key={k} value={k}>
                    {KLASSE_LABELS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {tilgjengelige.length === 0 && (
              <p className="text-sm text-muted-foreground">Alle klasser er allerede lagt til.</p>
            )}
          </div>

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
            <Button
              onClick={handleLeggTil}
              disabled={!klasseType || tilgjengelige.length === 0 || isPending}
            >
              {isPending ? "Legger til..." : "Legg til klasse"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
