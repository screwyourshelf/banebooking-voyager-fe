import {
  AdminEditorDialog,
  AdminFormActions,
  SettingsPanel,
  SettingsRow,
  SettingsSection,
  SettingsStack,
  SettingsText,
  SettingsValue,
} from "@/components/admin";
import { ServerFeil } from "@/components/errors";
import { RecordStatus, type RecordStatusTone } from "@/components/records";
import { Button } from "@/components/ui/button";
import type { KunngjøringAdminRespons } from "@/features/kunngjøringer/types/kunngjøring";
import { formatDatoKort, formatTidspunktKort } from "@/utils/datoUtils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: KunngjøringAdminRespons;
  onDeactivate: () => Promise<unknown>;
  isLoading: boolean;
  error: string | null;
};

export default function KunngjøringDetailsDialog({
  open,
  onOpenChange,
  announcement,
  onDeactivate,
  isLoading,
  error,
}: Props) {
  const confirmationTone: RecordStatusTone = !announcement.antallMålgruppe
    ? "past"
    : announcement.antallBekreftelser >= announcement.antallMålgruppe
      ? "available"
      : "warning";

  async function handleDeactivate() {
    try {
      await onDeactivate();
      onOpenChange(false);
    } catch {
      // Feilen vises i dialogen.
    }
  }

  return (
    <AdminEditorDialog
      open={open}
      onOpenChange={onOpenChange}
      backLabel="Alle kunngjøringer"
      eyebrow="Aktiv kunngjøring"
      title={announcement.tittel}
      description={`Publisert ${formatDatoKort(announcement.opprettetTidspunkt)}`}
      closeDisabled={isLoading}
      size="compact"
    >
      <SettingsStack embedded>
        <SettingsSection
          embedded
          eyebrow="Kunngjøring"
          title="Publisert innhold"
          description={`Aktiv til ${formatDatoKort(announcement.utløperTidspunkt)}.`}
        >
          <SettingsPanel>
            <SettingsRow title="Budskap">
              <SettingsText>{announcement.tekst}</SettingsText>
            </SettingsRow>
            <SettingsRow title="Status">
              <RecordStatus tone="available">Aktiv</RecordStatus>
            </SettingsRow>
          </SettingsPanel>
        </SettingsSection>

        <SettingsSection
          embedded
          eyebrow="Målgruppe"
          title="Bekreftelser"
          description="Brukere som har lest og bekreftet kunngjøringen."
        >
          <SettingsPanel>
            <SettingsRow title="Fremdrift">
              <RecordStatus tone={confirmationTone}>
                {announcement.antallBekreftelser} av {announcement.antallMålgruppe} bekreftet
              </RecordStatus>
            </SettingsRow>

            {announcement.bekreftelser.map((confirmation) => (
              <SettingsRow
                key={confirmation.epost}
                title={confirmation.visningsnavn}
                description={confirmation.epost}
              >
                <SettingsValue>
                  {formatTidspunktKort(confirmation.bekreftetTidspunkt)}
                </SettingsValue>
              </SettingsRow>
            ))}
          </SettingsPanel>
        </SettingsSection>

        <SettingsSection
          embedded
          eyebrow="Fareområde"
          title="Deaktiver kunngjøring"
          description="Brukere som ikke har bekreftet, blir ikke lenger blokkert."
          tone="danger"
        >
          <AdminFormActions>
            <ServerFeil feil={error} />
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleDeactivate()}
              disabled={isLoading}
            >
              {isLoading ? "Deaktiverer…" : "Deaktiver kunngjøring"}
            </Button>
          </AdminFormActions>
        </SettingsSection>
      </SettingsStack>
    </AdminEditorDialog>
  );
}
