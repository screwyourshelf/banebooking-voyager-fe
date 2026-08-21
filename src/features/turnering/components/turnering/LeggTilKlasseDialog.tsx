import { Dialog, Form, Settings } from "@/components";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
    <Dialog
      open={open}
      onOpenChange={handleClose}
      title="Legg til klasse"
      actions={
        <>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
            Avbryt
          </Button>
          <Button
            onClick={handleLeggTil}
            disabled={!klasseType || tilgjengelige.length === 0 || isPending}
          >
            {isPending ? "Legger til..." : "Legg til klasse"}
          </Button>
        </>
      }
    >
      <Form.Fields>
        <Form.Field label="Klasse">
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
          {tilgjengelige.length === 0 && <p>Alle klasser er allerede lagt til.</p>}
        </Form.Field>

        <Form.Field label="Struktur">
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
        </Form.Field>

        {struktur === "GruppeMedSluttspill" && (
          <>
            <Form.Field label="Antall sett · gruppespill">
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
            </Form.Field>
            <Form.Field label="Spill til · gruppespill">
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
            </Form.Field>
            <Settings.SwitchRow
              title="Super-tiebreak · gruppespill"
              description="Bruk super-tiebreak i siste sett."
              checked={gruppespillFormat.superTiebreak}
              onCheckedChange={(v) =>
                setGruppespillFormat({ ...gruppespillFormat, superTiebreak: v })
              }
              disabled={gruppespillFormat.antallSett === 1}
            />
          </>
        )}

        <Form.Field
          label={struktur === "GruppeMedSluttspill" ? "Antall sett · sluttspill" : "Antall sett"}
        >
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
        </Form.Field>
        <Form.Field
          label={struktur === "GruppeMedSluttspill" ? "Spill til · sluttspill" : "Spill til"}
        >
          <Select
            value={String(sluttspillFormat.spillTil)}
            onValueChange={(v) => setSluttspillFormat({ ...sluttspillFormat, spillTil: Number(v) })}
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
        </Form.Field>
        <Settings.SwitchRow
          title={
            struktur === "GruppeMedSluttspill" ? "Super-tiebreak · sluttspill" : "Super-tiebreak"
          }
          description="Bruk super-tiebreak i siste sett."
          checked={sluttspillFormat.superTiebreak}
          onCheckedChange={(v) => setSluttspillFormat({ ...sluttspillFormat, superTiebreak: v })}
          disabled={sluttspillFormat.antallSett === 1}
        />

        <ServerFeil feil={serverFeil ?? null} />
      </Form.Fields>
    </Dialog>
  );
}
