import { useState } from "react";
import { AppDialog } from "@/components/dialogs";
import { Grid, Stack, Text } from "@/components/layout";
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
    <AppDialog
      open={open}
      onOpenChange={handleClose}
      title={erRegenerer ? "Regenerer draw" : "Generer draw"}
      description={
        <>
          {antallPaameldte} påmeldte deltakere
          {erRegenerer && (
            <Text as="span" variant="danger">
              ⚠ Alle eksisterende grupper og kampoppsett for denne klassen vil slettes og bygges på
              nytt.
            </Text>
          )}
        </>
      }
      actions={
        <>
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
        </>
      }
    >
      <Stack gap="lg">
        {forFaaSpillere && (
          <Text variant="danger">Minst 2 påmeldte deltakere kreves for å generere draw.</Text>
        )}
        {klasseStruktur === "GruppeMedSluttspill" && (
          <Grid columns={2}>
            <Stack gap="xs">
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
            </Stack>
            <Stack gap="xs">
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
            </Stack>
          </Grid>
        )}
      </Stack>
    </AppDialog>
  );
}
