import { ServerFeil } from "@/components/errors";
import { RecordStatus, type RecordStatusTone } from "@/components/records";
import { Button } from "@/components/ui/button";
import type { KunngjøringAdminRespons } from "@/features/kunngjøringer/types/kunngjøring";
import { formatDatoKort, formatTidspunktKort } from "@/utils/datoUtils";
import { Form, Settings, Dialog } from "@/components";

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
    <Dialog.Editor
      open={open}
      onOpenChange={onOpenChange}
      backLabel="Alle kunngjøringer"
      eyebrow="Aktiv kunngjøring"
      title={announcement.tittel}
      description={`Publisert ${formatDatoKort(announcement.opprettetTidspunkt)}`}
      closeDisabled={isLoading}
    >
      <Settings.Stack embedded>
        <Settings.Section
          embedded
          eyebrow="Kunngjøring"
          title="Publisert innhold"
          description={`Aktiv til ${formatDatoKort(announcement.utløperTidspunkt)}.`}
        >
          <Settings.Panel>
            <Settings.Row title="Budskap">
              <Settings.Text>{announcement.tekst}</Settings.Text>
            </Settings.Row>
            <Settings.Row title="Status">
              <RecordStatus tone="available">Aktiv</RecordStatus>
            </Settings.Row>
          </Settings.Panel>
        </Settings.Section>

        <Settings.Section
          embedded
          eyebrow="Målgruppe"
          title="Bekreftelser"
          description="Brukere som har lest og bekreftet kunngjøringen."
        >
          <Settings.Panel>
            <Settings.Row title="Fremdrift">
              <RecordStatus tone={confirmationTone}>
                {announcement.antallBekreftelser} av {announcement.antallMålgruppe} bekreftet
              </RecordStatus>
            </Settings.Row>

            {announcement.bekreftelser.map((confirmation) => (
              <Settings.Row
                key={confirmation.epost}
                title={confirmation.visningsnavn}
                description={confirmation.epost}
              >
                <Settings.Value>
                  {formatTidspunktKort(confirmation.bekreftetTidspunkt)}
                </Settings.Value>
              </Settings.Row>
            ))}
          </Settings.Panel>
        </Settings.Section>

        <Settings.Section
          embedded
          eyebrow="Fareområde"
          title="Deaktiver kunngjøring"
          description="Brukere som ikke har bekreftet, blir ikke lenger blokkert."
          tone="danger"
        >
          <Form.Actions>
            <ServerFeil feil={error} />
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleDeactivate()}
              disabled={isLoading}
            >
              {isLoading ? "Deaktiverer…" : "Deaktiver kunngjøring"}
            </Button>
          </Form.Actions>
        </Settings.Section>
      </Settings.Stack>
    </Dialog.Editor>
  );
}
