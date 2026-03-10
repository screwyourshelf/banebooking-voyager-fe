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
import { ServerFeil } from "@/components/errors";
import {
  erGyldigSettScore,
  erVinnerReflektertISett,
  vinnerHarNokSett,
  erAntallSettGyldig,
  erVinnerKorrektVedAvslutning,
} from "../../utils/turneringValidering";

type Props = {
  kamp: GruppeKampVisning | SluttspillKampVisning;
  antallSett: number;
  superTiebreak: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: RegistrerResultatForespørsel) => void;
  isPending: boolean;
  serverFeil?: string | null;
};

type SettInput = { spiller1: string; spiller2: string };

export function ResultatDialog({
  kamp,
  antallSett,
  superTiebreak,
  open,
  onOpenChange,
  onSubmit,
  isPending,
  serverFeil,
}: Props) {
  const [vinner, setVinner] = useState<KampVinner | null>(null);
  const [avslutning, setAvslutning] = useState<KampAvslutning>("Normal");
  const [sett, setSett] = useState<SettInput[]>(() =>
    Array.from({ length: antallSett }, () => ({ spiller1: "", spiller2: "" }))
  );
  const [clientFeil, setClientFeil] = useState<string | null>(null);
  const [settFeil, setSettFeil] = useState<(string | null)[]>(() =>
    Array.from({ length: antallSett }, () => null)
  );

  const sp1Navn = kamp.spiller1Navn ?? "Spiller 1";
  const sp2Navn = kamp.spiller2Navn ?? "Spiller 2";

  function oppdaterSett(idx: number, felt: keyof SettInput, verdi: string) {
    setSett((prev) => prev.map((s, i) => (i === idx ? { ...s, [felt]: verdi } : s)));
    setSettFeil((prev) => prev.map((f, i) => (i === idx ? null : f)));
    setClientFeil(null);
  }

  function handleSubmit() {
    if (!vinner) return;

    const filledSett = sett
      .map((s, idx) => ({
        idx,
        spiller1: parseInt(s.spiller1) || 0,
        spiller2: parseInt(s.spiller2) || 0,
        filled: s.spiller1 !== "" || s.spiller2 !== "",
      }))
      .filter((s) => s.filled);

    const nySettFeil: (string | null)[] = sett.map(() => null);
    let nyClientFeil: string | null = null;

    const skaValidereSett =
      avslutning === "Normal" ? filledSett : filledSett.slice(0, -1);

    for (const s of skaValidereSett) {
      const erSisteSet = s.idx === antallSett - 1;
      const erSuperTiebreakSett = erSisteSet && superTiebreak;
      if (!erGyldigSettScore(s.spiller1, s.spiller2, erSuperTiebreakSett)) {
        nySettFeil[s.idx] = erSuperTiebreakSett
          ? "Ugyldig super-tiebreak score (min 10, vinn med 2)"
          : "Ugyldig sett-score (f.eks. 6-4, 7-5, 7-6)";
      }
    }

    if (avslutning === "Normal") {
      if (filledSett.length === 0) {
        nyClientFeil = "Minst ett sett må registreres";
      } else {
        const parsed = filledSett.map((s) => ({
          spiller1Games: s.spiller1,
          spiller2Games: s.spiller2,
        }));
        if (!erVinnerReflektertISett(vinner, parsed)) {
          nyClientFeil = "Vinneren har ikke vunnet flest sett";
        } else if (!vinnerHarNokSett(vinner, parsed, antallSett)) {
          nyClientFeil = `Vinneren må ha vunnet minst ${Math.ceil(antallSett / 2)} sett`;
        } else if (!erAntallSettGyldig(parsed, antallSett)) {
          nyClientFeil = "Det er registrert for mange sett — kampen var allerede avgjort";
        }
      }
    } else if (filledSett.length > 0) {
      const parsed = filledSett.map((s) => ({
        spiller1Games: s.spiller1,
        spiller2Games: s.spiller2,
      }));
      if (!erVinnerKorrektVedAvslutning(vinner, parsed, avslutning)) {
        nyClientFeil = "Vinneren stemmer ikke med de fullspilte settene";
      }
    }

    setSettFeil(nySettFeil);
    setClientFeil(nyClientFeil);
    if (nyClientFeil || nySettFeil.some((f) => f !== null)) return;

    const settData: SettResultat[] = filledSett.map((s) => ({
      settNummer: s.idx + 1,
      spiller1Games: s.spiller1,
      spiller2Games: s.spiller2,
    }));

    onSubmit({ vinner, avslutning, sett: settData });
  }

  function handleClose(v: boolean) {
    if (!v) {
      setVinner(null);
      setAvslutning("Normal");
      setSett(Array.from({ length: antallSett }, () => ({ spiller1: "", spiller2: "" })));
      setClientFeil(null);
      setSettFeil(Array.from({ length: antallSett }, () => null));
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
              <div key={idx} className="space-y-1">
                <div className="flex items-center gap-2">
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
                {settFeil[idx] && (
                  <p className="text-xs text-destructive pl-14">{settFeil[idx]}</p>
                )}
              </div>
            ))}
          </div>

          {clientFeil && <p className="text-sm text-destructive">{clientFeil}</p>}
          <ServerFeil feil={serverFeil ?? null} />
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
