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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  klasseStruktur: TurneringStruktur;
  antallGodkjente: number;
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
  antallGodkjente,
  erRegenerer,
  onGenerer,
  isPending,
}: Props) {
  const anbefaltAntallGrupper = anbefalAntallGrupper(antallGodkjente);
  const [antallGrupper, setAntallGrupper] = useState<number>(anbefaltAntallGrupper);

  function handleGenerer() {
    const payload: GenererDrawForespørsel = {};
    if (klasseStruktur === "GruppeMedSluttspill") {
      payload.antallGrupper = antallGrupper;
      payload.antallSomGaarViderePerGruppe = 2;
    }
    onGenerer(payload);
  }

  function handleClose(v: boolean) {
    if (!v) {
      setAntallGrupper(anbefaltAntallGrupper);
    }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{erRegenerer ? "Regenerer draw" : "Generer draw"}</DialogTitle>
          <DialogDescription>
            {antallGodkjente} godkjente deltakere
            {erRegenerer && (
              <span className="block mt-1 text-destructive font-medium">
                ⚠ Alle eksisterende grupper og kampoppsett for denne klassen vil slettes og bygges
                på nytt.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {klasseStruktur === "GruppeMedSluttspill" && (
            <div className="space-y-1.5">
              <Label>Antall grupper</Label>
              <Select
                value={String(antallGrupper)}
                onValueChange={(v) => setAntallGrupper(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} grupper
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
              Avbryt
            </Button>
            <Button
              onClick={handleGenerer}
              disabled={isPending}
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
