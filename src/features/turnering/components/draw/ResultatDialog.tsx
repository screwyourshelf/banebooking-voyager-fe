import { useState } from "react";
import ScoreInput from "@/components/controls/ScoreInput";
import { AppDialog } from "@/components/dialogs";
import { Inline, Stack, Text } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

    const skaValidereSett = avslutning === "Normal" ? filledSett : filledSett.slice(0, -1);

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
    <AppDialog
      open={open}
      onOpenChange={handleClose}
      title="Registrer resultat"
      description={`${sp1Navn} vs. ${sp2Navn}`}
      actions={
        <>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
            Avbryt
          </Button>
          <Button onClick={handleSubmit} disabled={!vinner || isPending}>
            {isPending ? "Lagrer..." : "Lagre resultat"}
          </Button>
        </>
      }
    >
      <Stack gap="lg">
        <Stack gap="sm">
          <Label>Vinner</Label>
          <Inline wrap>
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
          </Inline>
        </Stack>

        <Stack gap="sm">
          <Label>Avslutning</Label>
          <Inline wrap>
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
          </Inline>
        </Stack>

        <Stack gap="sm">
          <Label>Sett</Label>
          {sett.map((s, idx) => (
            <Stack key={idx} gap="xs">
              <Inline>
                <Text as="span" variant="muted">
                  Sett {idx + 1}
                </Text>
                <ScoreInput
                  min={0}
                  max={99}
                  value={s.spiller1}
                  onChange={(e) => oppdaterSett(idx, "spiller1", e.target.value)}
                  placeholder="0"
                />
                <Text as="span" variant="muted">
                  –
                </Text>
                <ScoreInput
                  min={0}
                  max={99}
                  value={s.spiller2}
                  onChange={(e) => oppdaterSett(idx, "spiller2", e.target.value)}
                  placeholder="0"
                />
              </Inline>
              {settFeil[idx] && <Text variant="danger">{settFeil[idx]}</Text>}
            </Stack>
          ))}
        </Stack>

        {clientFeil && <Text variant="danger">{clientFeil}</Text>}
        <ServerFeil feil={serverFeil ?? null} />
      </Stack>
    </AppDialog>
  );
}
