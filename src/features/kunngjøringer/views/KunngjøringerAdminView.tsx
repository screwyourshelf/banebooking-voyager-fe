import { useState } from "react";
import { CircleAlert, Megaphone, Plus } from "lucide-react";
import {
  AdminEntityCollection,
  AdminEntityList,
  AdminEntityRow,
  AdminPageLoading,
  AdminPageState,
} from "@/components/admin";
import { RecordListState } from "@/components/records";
import { Button } from "@/components/ui/button";
import KunngjøringDetailsDialog from "@/features/kunngjøringer/components/KunngjøringDetailsDialog";
import KunngjøringEditorDialog from "@/features/kunngjøringer/components/KunngjøringEditorDialog";
import { useKunngjøringAdmin } from "@/features/kunngjøringer/hooks/useKunngjøringAdmin";
import { formatDatoKort } from "@/utils/datoUtils";

export default function KunngjøringerAdminView() {
  const {
    aktiv,
    laster,
    isFetching,
    error,
    refetch,
    opprett,
    opprettLaster,
    opprettFeil,
    deaktiver,
    deaktiverLaster,
    deaktiverFeil,
  } = useKunngjøringAdmin();
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (laster) return <AdminPageLoading label="Laster kunngjøringer" />;

  if (error) {
    return (
      <AdminPageState>
        <RecordListState
          icon={<CircleAlert aria-hidden="true" />}
          title="Kunne ikke laste kunngjøringer"
          description={error.message}
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              {isFetching ? "Prøver igjen…" : "Prøv igjen"}
            </Button>
          }
          tone="danger"
          role="alert"
        />
      </AdminPageState>
    );
  }

  const newButton = (
    <Button
      type="button"
      size="sm"
      onClick={() => setCreateOpen(true)}
      disabled={Boolean(aktiv)}
      title={aktiv ? "Deaktiver den aktive kunngjøringen før du oppretter en ny" : undefined}
    >
      <Plus aria-hidden="true" />
      Ny
    </Button>
  );

  return (
    <>
      <AdminEntityCollection
        icon={<Megaphone aria-hidden="true" />}
        title={aktiv ? "1 aktiv kunngjøring" : "Ingen aktiv kunngjøring"}
        description="Informasjon som krever bekreftelse"
        contextAction={newButton}
      >
        {aktiv ? (
          <AdminEntityList>
            <AdminEntityRow
              title={aktiv.tittel}
              meta={`Utløper ${formatDatoKort(aktiv.utløperTidspunkt)}`}
              description={`${aktiv.antallBekreftelser} av ${aktiv.antallMålgruppe} har bekreftet`}
              status="Aktiv"
              statusTone="available"
              onSelect={() => setDetailsOpen(true)}
            />
          </AdminEntityList>
        ) : (
          <RecordListState
            icon={<Megaphone aria-hidden="true" />}
            title="Klar for neste beskjed"
            description="Opprett en kunngjøring når alle brukere må lese viktig informasjon."
          />
        )}
      </AdminEntityCollection>

      <KunngjøringEditorDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={opprett}
        isLoading={opprettLaster}
        error={opprettFeil?.message ?? null}
      />

      {aktiv ? (
        <KunngjøringDetailsDialog
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          announcement={aktiv}
          onDeactivate={() => deaktiver(aktiv.id)}
          isLoading={deaktiverLaster}
          error={deaktiverFeil?.message ?? null}
        />
      ) : null}
    </>
  );
}
