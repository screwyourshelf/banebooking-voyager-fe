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
import type {
  OppdaterKlasseStrukturForespørsel,
  TurneringKlasseRespons,
  TurneringStruktur,
} from "@/types";
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
    <Dialog
      open={open}
      onOpenChange={handleClose}
      title={`Rediger klasse – ${klasseTypeNavn(klasse.klasseType)}`}
      actions={
        <>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
            Avbryt
          </Button>
          <Button onClick={handleOppdater} disabled={isPending}>
            {isPending ? "Lagrer..." : "Lagre endringer"}
          </Button>
        </>
      }
    >
      <Form.Fields>
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
