import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { BrukerRespons, RolleType, EditState } from "@/features/brukere/types";

type Props = {
  aktivBruker: BrukerRespons;
  edit: EditState;
  onEditChange: (update: Partial<EditState>) => void;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
};

export default function RedigerBrukerDialog({
  aktivBruker,
  edit,
  onEditChange,
  onClose,
  onSave,
  isSaving,
}: Props) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rediger bruker</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Bruker</div>
            <div className="text-sm font-medium break-words">{aktivBruker.epost}</div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Visningsnavn</div>

            <Field>
              <Input
                id="visningsnavn"
                value={edit.visningsnavn}
                onChange={(e) => onEditChange({ visningsnavn: e.target.value })}
                placeholder="Valgfritt"
                className="bg-background"
              />
            </Field>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Rolle</div>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={edit.rolle}
              onChange={(e) => onEditChange({ rolle: e.target.value as RolleType })}
            >
              <option value="Medlem">Medlem</option>
              <option value="Utvidet">Utvidet</option>
              <option value="KlubbAdmin">KlubbAdmin</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
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
