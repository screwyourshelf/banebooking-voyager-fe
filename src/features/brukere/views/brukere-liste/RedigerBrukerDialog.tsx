import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ServerFeil } from "@/components/errors";
import { ShieldCheck, UserRound } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { BrukerRespons, RolleType, EditState } from "@/features/brukere/types";
import { ROLLE_VALG } from "@/utils/brukerPresentation";

type Props = {
  aktivBruker: BrukerRespons;
  edit: EditState;
  onEditChange: (update: Partial<EditState>) => void;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  serverFeil: string | null;
};

export default function RedigerBrukerDialog({
  aktivBruker,
  edit,
  onEditChange,
  onClose,
  onSave,
  isSaving,
  serverFeil,
}: Props) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="user-editor-dialog">
        <DialogHeader className="user-editor-dialog__header">
          <DialogTitle>Rediger bruker</DialogTitle>
          <DialogDescription>Oppdater visningsnavn og rolle.</DialogDescription>
        </DialogHeader>

        <div className="user-editor-dialog__identity">
          <span aria-hidden="true">
            <UserRound />
          </span>
          <div>
            <strong>{aktivBruker.visningsnavn || "Bruker uten visningsnavn"}</strong>
            <small>{aktivBruker.epost}</small>
          </div>
        </div>

        <div className="user-editor-dialog__fields">
          <label htmlFor="visningsnavn">
            <span>Visningsnavn</span>
            <Input
              id="visningsnavn"
              value={edit.visningsnavn}
              onChange={(event) => onEditChange({ visningsnavn: event.target.value })}
              placeholder="Valgfritt"
            />
          </label>

          <label htmlFor="brukerrolle">
            <span>Rolle</span>
            <select
              id="brukerrolle"
              className="user-editor-dialog__select"
              value={edit.rolle}
              onChange={(event) => onEditChange({ rolle: event.target.value as RolleType })}
            >
              {ROLLE_VALG.map((rolle) => (
                <option key={rolle.value} value={rolle.value}>
                  {rolle.label}
                </option>
              ))}
            </select>
            <small>
              <ShieldCheck aria-hidden="true" />
              Rollen styrer hvilke deler av administrasjonen brukeren kan åpne.
            </small>
          </label>
        </div>

        <DialogFooter className="user-editor-dialog__footer">
          <ServerFeil feil={serverFeil} />
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Avbryt
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? "Lagrer..." : "Lagre"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
