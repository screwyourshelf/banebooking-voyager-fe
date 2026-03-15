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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GenererDrawForespørsel, TurneringStruktur } from "@/types";
import {
  erGyldigAntallGrupper,
  gyldigeSomGaarVidereAlternativer,
} from "../../utils/turneringValidering";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  klasseStruktur: TurneringStruktur;
  antallPaameldte: number;
  erRegenerer: boolean;
  onGenerer: (payload: GenererDrawForespørsel) => void;
  isPending: boolean;
};

function anbefalAntallGrupper(antall: number): number {
  if (antall <= 5) return 1;
  if (antall <= 8) return 2;
  if (antall <= 12) return 3;
  return 4;
}

export function GenererDrawDialog({
  open,
  onOpenChange,
  klasseStruktur,
  antallPaameldte,
  erRegenerer,
  onGenerer,
  isPending,
}: Props) {
  const anbefaltAntallGrupper = anbefalAntallGrupper(antallPaameldte);
  const [antallGrupper, setAntallGrupper] = useState<number>(anbefaltAntallGrupper);
  const [antallSomGaarViderePerGruppe, setAntallSomGaarViderePerGruppe] = useState<number>(2);

  const forFaaSpillere = antallPaameldte < 2;
  const tilgjengeligeGrupper = [1, 2, 3, 4].filter((n) =>
    erGyldigAntallGrupper(antallPaameldte, n)
  );
  const tilgjengeligeVidere = gyldigeSomGaarVidereAlternativer(antallGrupper);

  function handleAntallGrupperChange(v: number) {
    setAntallGrupper(v);
    const gyldige = gyldigeSomGaarVidereAlternativer(v);
    if (!gyldige.includes(antallSomGaarViderePerGruppe)) {
      setAntallSomGaarViderePerGruppe(gyldige[0] ?? 2);
    }
  }

  function handleGenerer() {
    const payload: GenererDrawForespørsel = {};
    if (klasseStruktur === "GruppeMedSluttspill") {
      payload.antallGrupper = antallGrupper;
      payload.antallSomGaarViderePerGruppe = antallSomGaarViderePerGruppe;
    }
    onGenerer(payload);
  }

  function handleClose(v: boolean) {
    if (!v) {
      setAntallGrupper(anbefaltAntallGrupper);
      setAntallSomGaarViderePerGruppe(2);
    }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{erRegenerer ? "Regenerer draw" : "Generer draw"}</DialogTitle>
          <DialogDescription>
            {antallPaameldte} påmeldte deltakere
            {erRegenerer && (
              <span className="block mt-1 text-destructive font-medium">
                ⚠ Alle eksisterende grupper og kampoppsett for denne klassen vil slettes og bygges
                på nytt.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {forFaaSpillere && (
            <p className="text-sm text-destructive">
              Minst 2 påmeldte deltakere kreves for å generere draw.
            </p>
          )}
          {klasseStruktur === "GruppeMedSluttspill" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Antall grupper</Label>
                <Select
                  value={String(antallGrupper)}
                  onValueChange={(v) => handleAntallGrupperChange(Number(v))}
                  disabled={forFaaSpillere}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tilgjengeligeGrupper.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} {n === 1 ? "gruppe" : "grupper"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Videre per gruppe</Label>
                <Select
                  value={String(antallSomGaarViderePerGruppe)}
                  onValueChange={(v) => setAntallSomGaarViderePerGruppe(Number(v))}
                  disabled={forFaaSpillere}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tilgjengeligeVidere.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
              Avbryt
            </Button>
            <Button
              onClick={handleGenerer}
              disabled={isPending || forFaaSpillere}
              variant={erRegenerer ? "destructive" : "default"}
            >
              {isPending ? "Genererer..." : erRegenerer ? "Ja, regenerer draw" : "Generer draw"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
