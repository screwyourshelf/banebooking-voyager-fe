import { ServerFeil } from "@/components/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, Settings, Dialog } from "@/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BrukerRespons, EditState, RolleType } from "@/features/brukere/types";
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
    <Dialog.Editor
      open
      onOpenChange={(open) => !open && onClose()}
      backLabel="Alle brukere"
      eyebrow="Bruker"
      title="Rediger bruker"
      description={aktivBruker.epost}
      closeDisabled={isSaving}
    >
      <Form
        variant="editor"
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        <Settings.Stack embedded>
          <Settings.Section
            embedded
            eyebrow="Profil og tilgang"
            title={aktivBruker.visningsnavn || "Bruker uten visningsnavn"}
            description="Oppdater navnet som vises i klubben og hvilken tilgang brukeren har."
          >
            <Form.Fields>
              <Form.Field label="Visningsnavn" htmlFor="visningsnavn">
                <Input
                  id="visningsnavn"
                  aria-label="Visningsnavn"
                  value={edit.visningsnavn}
                  onChange={(event) => onEditChange({ visningsnavn: event.target.value })}
                  placeholder="Valgfritt"
                  disabled={isSaving}
                />
              </Form.Field>

              <Form.Field
                label="Rolle"
                htmlFor="brukerrolle"
                description="Rollen styrer hvilke deler av administrasjonen brukeren kan åpne."
              >
                <Select
                  value={edit.rolle}
                  onValueChange={(value) => onEditChange({ rolle: value as RolleType })}
                  disabled={isSaving}
                >
                  <SelectTrigger id="brukerrolle" aria-label="Rolle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLLE_VALG.map((rolle) => (
                      <SelectItem key={rolle.value} value={rolle.value}>
                        {rolle.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Form.Field>
            </Form.Fields>
          </Settings.Section>

          <Form.Actions>
            <ServerFeil feil={serverFeil} />
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Avbryt
            </Button>
            <Form.Submit isLoading={isSaving} loadingText="Lagrer…">
              Lagre
            </Form.Submit>
          </Form.Actions>
        </Settings.Stack>
      </Form>
    </Dialog.Editor>
  );
}
