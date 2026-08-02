import {
  AdminEditorDialog,
  AdminEditorForm,
  AdminFormActions,
  AdminFormSubmitButton,
  SettingsPanel,
  SettingsRow,
  SettingsSection,
  SettingsStack,
} from "@/components/admin";
import { ServerFeil } from "@/components/errors";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
    <AdminEditorDialog
      open
      onOpenChange={(open) => !open && onClose()}
      backLabel="Alle brukere"
      eyebrow="Bruker"
      title="Rediger bruker"
      description={aktivBruker.epost}
      closeDisabled={isSaving}
      size="compact"
    >
      <AdminEditorForm
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        <SettingsStack embedded>
          <SettingsSection
            embedded
            eyebrow="Profil og tilgang"
            title={aktivBruker.visningsnavn || "Bruker uten visningsnavn"}
            description="Oppdater navnet som vises i klubben og hvilken tilgang brukeren har."
          >
            <SettingsPanel>
              <SettingsRow title="Visningsnavn">
                <Field>
                  <Input
                    id="visningsnavn"
                    aria-label="Visningsnavn"
                    value={edit.visningsnavn}
                    onChange={(event) => onEditChange({ visningsnavn: event.target.value })}
                    placeholder="Valgfritt"
                    disabled={isSaving}
                  />
                </Field>
              </SettingsRow>

              <SettingsRow
                title="Rolle"
                description="Rollen styrer hvilke deler av administrasjonen brukeren kan åpne."
              >
                <Field>
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
                </Field>
              </SettingsRow>
            </SettingsPanel>
          </SettingsSection>

          <AdminFormActions>
            <ServerFeil feil={serverFeil} />
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Avbryt
            </Button>
            <AdminFormSubmitButton isLoading={isSaving} loadingText="Lagrer…">
              Lagre
            </AdminFormSubmitButton>
          </AdminFormActions>
        </SettingsStack>
      </AdminEditorForm>
    </AdminEditorDialog>
  );
}
