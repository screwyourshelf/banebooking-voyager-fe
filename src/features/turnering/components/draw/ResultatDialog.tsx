import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type {
  GruppeKampVisning,
  KampAvslutning,
  KampVinner,
  RegistrerResultatForespørsel,
  SettResultat,
  SluttspillKampVisning,
} from "@/types";

type Props = {
  kamp: GruppeKampVisning | SluttspillKampVisning;
  antallSett: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: RegistrerResultatForespørsel) => void;
  isPending: boolean;
};

type SettInput = { spiller1: string; spiller2: string };

export function ResultatDialog({
  kamp,
  antallSett,
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: Props) {
  const [vinner, setVinner] = useState<KampVinner | null>(null);
  const [avslutning, setAvslutning] = useState<KampAvslutning>("Normal");
  const [sett, setSett] = useState<SettInput[]>(() =>
    Array.from({ length: antallSett }, () => ({ spiller1: "", spiller2: "" }))
  );

  const sp1Navn = kamp.spiller1Navn ?? "Spiller 1";
  const sp2Navn = kamp.spiller2Navn ?? "Spiller 2";

  function oppdaterSett(idx: number, felt: keyof SettInput, verdi: string) {
    setSett((prev) => prev.map((s, i) => (i === idx ? { ...s, [felt]: verdi } : s)));
  }

  function handleSubmit() {
    if (!vinner) return;

    const settData: SettResultat[] = sett
      .filter((s) => s.spiller1 !== "" || s.spiller2 !== "")
      .map((s, idx) => ({
        settNummer: idx + 1,
        spiller1Games: parseInt(s.spiller1) || 0,
        spiller2Games: parseInt(s.spiller2) || 0,
      }));

    onSubmit({ vinner, avslutning, sett: settData });
  }

  function handleClose(v: boolean) {
    if (!v) {
      setVinner(null);
      setAvslutning("Normal");
      setSett(Array.from({ length: antallSett }, () => ({ spiller1: "", spiller2: "" })));
    }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrer resultat</DialogTitle>
          <DialogDescription>
            {sp1Navn} vs. {sp2Navn}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Vinner</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={vinner === "Spiller1" ? "default" : "outline"}
                size="sm"
                onClick={() => setVinner("Spiller1")}
              >
                {sp1Navn}
              </Button>
              <Button
                type="button"
                variant={vinner === "Spiller2" ? "default" : "outline"}
                size="sm"
                onClick={() => setVinner("Spiller2")}
              >
                {sp2Navn}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Avslutning</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={avslutning === "Normal" ? "default" : "outline"}
                size="sm"
                onClick={() => setAvslutning("Normal")}
              >
                Normal
              </Button>
              <Button
                type="button"
                variant={avslutning === "Retired" ? "default" : "outline"}
                size="sm"
                onClick={() => setAvslutning("Retired")}
              >
                Retired
              </Button>
              <Button
                type="button"
                variant={avslutning === "Default" ? "default" : "outline"}
                size="sm"
                onClick={() => setAvslutning("Default")}
              >
                Default
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sett</Label>
            {sett.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-12">Sett {idx + 1}</span>
                <Input
                  type="number"
                  min={0}
                  max={99}
                  value={s.spiller1}
                  onChange={(e) => oppdaterSett(idx, "spiller1", e.target.value)}
                  className="w-16 text-center"
                  placeholder="0"
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="number"
                  min={0}
                  max={99}
                  value={s.spiller2}
                  onChange={(e) => oppdaterSett(idx, "spiller2", e.target.value)}
                  className="w-16 text-center"
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
              Avbryt
            </Button>
            <Button onClick={handleSubmit} disabled={!vinner || isPending}>
              {isPending ? "Lagrer..." : "Lagre resultat"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
