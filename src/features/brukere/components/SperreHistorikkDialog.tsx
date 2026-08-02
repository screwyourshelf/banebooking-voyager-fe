import {
  AdminEditorDialog,
  SettingsPanel,
  SettingsRow,
  SettingsSection,
  SettingsStack,
  SettingsText,
} from "@/components/admin";
import { ServerFeil } from "@/components/errors";
import { RecordListState, RecordStatus } from "@/components/records";
import { Button } from "@/components/ui/button";
import { useBrukerSperrer } from "@/features/brukere/hooks/useAdminBrukersperre";
import { formatDatoKort, formatTidspunktKort } from "@/utils/datoUtils";

type Props = {
  brukerId: string;
  brukerEpost: string;
  kanOppheve: boolean;
  onOpphev: (sperreId: string) => Promise<void>;
  opphevLaster: boolean;
  opphevFeil: string | null;
  onClose: () => void;
};

export default function SperreHistorikkDialog({
  brukerId,
  brukerEpost,
  kanOppheve,
  onOpphev,
  opphevLaster,
  opphevFeil,
  onClose,
}: Props) {
  const { data, isLoading, error, refetch } = useBrukerSperrer(brukerId, true);

  return (
    <AdminEditorDialog
      open
      onOpenChange={(open) => !open && onClose()}
      backLabel="Til brukeren"
      eyebrow="Tilgang"
      title="Sperrehistorikk"
      description={brukerEpost}
      closeDisabled={opphevLaster}
      size="compact"
    >
      <SettingsStack embedded>
        <SettingsSection
          embedded
          eyebrow="Historikk"
          title="Registrerte sperrer"
          description="Aktive, utløpte og opphevede sperrer for denne brukeren."
        >
          {isLoading ? (
            <RecordListState
              title="Henter sperrer…"
              description="Dette tar vanligvis bare et øyeblikk."
            />
          ) : error ? (
            <RecordListState
              title="Kunne ikke hente sperrene"
              description={error.message}
              action={
                <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                  Prøv igjen
                </Button>
              }
            />
          ) : data?.sperrer.length ? (
            <SettingsPanel>
              {data.sperrer.map((sperre) => {
                const status = sperre.erAktiv
                  ? { label: "Aktiv", tone: "danger" as const }
                  : sperre.opphevtTidspunkt
                    ? { label: "Opphevet", tone: "past" as const }
                    : { label: "Utløpt", tone: "past" as const };

                return (
                  <SettingsRow
                    key={sperre.id}
                    title={sperre.årsak}
                    description={`Sperret ${formatTidspunktKort(sperre.opprettetTidspunkt)} av ${sperre.opprettetAv}`}
                    right={<RecordStatus tone={status.tone}>{status.label}</RecordStatus>}
                  >
                    <SettingsText>
                      {sperre.aktivTil
                        ? `Utløper ${formatDatoKort(sperre.aktivTil)}`
                        : "Ingen utløpsdato"}
                      {sperre.opphevtAv && sperre.opphevtTidspunkt
                        ? `\nOpphevet ${formatTidspunktKort(sperre.opphevtTidspunkt)} av ${sperre.opphevtAv}`
                        : ""}
                    </SettingsText>

                    {sperre.erAktiv && kanOppheve ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={opphevLaster}
                        onClick={() => void onOpphev(sperre.id)}
                      >
                        {opphevLaster ? "Opphever…" : "Opphev sperre"}
                      </Button>
                    ) : null}
                  </SettingsRow>
                );
              })}
            </SettingsPanel>
          ) : (
            <RecordListState
              title="Ingen sperrer"
              description="Det er ikke registrert sperrer for denne brukeren."
            />
          )}
        </SettingsSection>

        <ServerFeil feil={opphevFeil} title="Kunne ikke oppheve sperren" />
      </SettingsStack>
    </AdminEditorDialog>
  );
}
