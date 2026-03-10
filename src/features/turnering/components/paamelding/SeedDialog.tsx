import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sett seed – {spillerNavn}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Seed (la stå tomt for å fjerne)</Label>
            <Input
              type="number"
              min={1}
              value={verdi}
              onChange={(e) => setVerdi(e.target.value)}
              placeholder="t.eks. 1"
            />
          </div>

          <ServerFeil feil={serverFeil ?? null} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
              Avbryt
            </Button>
            <Button onClick={handleOppdater} disabled={isPending}>
              {isPending ? "Lagrer..." : "Lagre"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
