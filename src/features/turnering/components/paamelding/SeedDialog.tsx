import { useState } from "react";
import { AppDialog } from "@/components/dialogs";
import { Stack } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ServerFeil } from "@/components/errors";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spillerNavn: string;
  gjeldendeSeed: number | null;
  onOppdater: (seed: number | null) => void;
  isPending: boolean;
  serverFeil?: string | null;
};

export function SeedDialog({
  open,
  onOpenChange,
  spillerNavn,
  gjeldendeSeed,
  onOppdater,
  isPending,
  serverFeil,
}: Props) {
  const [verdi, setVerdi] = useState<string>(gjeldendeSeed != null ? String(gjeldendeSeed) : "");

  function handleOppdater() {
    const trimmed = verdi.trim();
    const parsed = trimmed === "" ? null : Number(trimmed);
    onOppdater(parsed);
  }

  function handleClose(v: boolean) {
    if (!v) {
      setVerdi(gjeldendeSeed != null ? String(gjeldendeSeed) : "");
    }
    onOpenChange(v);
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={handleClose}
      title={`Sett seed – ${spillerNavn}`}
      actions={
        <>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
            Avbryt
          </Button>
          <Button onClick={handleOppdater} disabled={isPending}>
            {isPending ? "Lagrer..." : "Lagre"}
          </Button>
        </>
      }
    >
      <Stack gap="lg">
        <Stack gap="xs">
          <Label>Seed (la stå tomt for å fjerne)</Label>
          <Input
            type="number"
            min={1}
            value={verdi}
            onChange={(e) => setVerdi(e.target.value)}
            placeholder="t.eks. 1"
          />
        </Stack>

        <ServerFeil feil={serverFeil ?? null} />
      </Stack>
    </AppDialog>
  );
}
