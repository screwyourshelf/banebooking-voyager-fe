import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ServerFeil } from "@/components/errors";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OppdaterPaameldingStatusForespørsel, PaameldingStatus } from "@/types";

const GYLDIGE_OVERGANGER: Record<PaameldingStatus, PaameldingStatus[]> = {
  Sokt: ["Godkjent", "Avslatt", "Reserve"],
  Reserve: ["Godkjent"],
  Godkjent: ["Avslatt"],
  Avslatt: [],
  TrukketSeg: [],
};

const STATUS_LABELS: Record<PaameldingStatus, string> = {
  Sokt: "Søkt",
  Godkjent: "Godkjent",
  Reserve: "Reserve",
  Avslatt: "Avslått",
  TrukketSeg: "Trukket seg",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spillerNavn: string;
  gjeldendStatus: PaameldingStatus;
  onOppdater: (payload: OppdaterPaameldingStatusForespørsel) => void;
  isPending: boolean;
  serverFeil?: string | null;
};

export function PaameldingStatusDialog({
  open,
  onOpenChange,
  spillerNavn,
  gjeldendStatus,
  onOppdater,
  isPending,
  serverFeil,
}: Props) {
  const muligeStatuser = GYLDIGE_OVERGANGER[gjeldendStatus] ?? [];
  const [nyStatus, setNyStatus] = useState<PaameldingStatus | "">(muligeStatuser[0] ?? "");
  const [merknad, setMerknad] = useState("");

  function handleOppdater() {
    if (!nyStatus) return;
    onOppdater({ nyStatus, adminMerknad: merknad || undefined });
  }

  function handleClose(v: boolean) {
    if (!v) {
      setNyStatus(muligeStatuser[0] ?? "");
      setMerknad("");
    }
    onOpenChange(v);
  }

  if (muligeStatuser.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Endre status – {spillerNavn}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Ny status</Label>
            <Select value={nyStatus} onValueChange={(v) => setNyStatus(v as PaameldingStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {muligeStatuser.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Intern merknad (valgfritt)</Label>
            <Textarea
              value={merknad}
              onChange={(e) => setMerknad(e.target.value)}
              placeholder="Kun synlig for admin"
              rows={2}
            />
          </div>

          <ServerFeil feil={serverFeil ?? null} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
              Avbryt
            </Button>
            <Button onClick={handleOppdater} disabled={!nyStatus || isPending}>
              {isPending ? "Lagrer..." : "Oppdater status"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
