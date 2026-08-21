import { CircleAlert, Megaphone } from "lucide-react";
import { useState } from "react";
import { Collection, Page } from "@/components";

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

  return (
    <Page
      eyebrow="Administrasjon"
      title="Kunngjøringer"
      description="Styr informasjon som må leses og bekreftes før brukerne går videre."
      createAction={
        aktiv
          ? undefined
          : {
              label: "Ny kunngjøring",
              onClick: () => setCreateOpen(true),
              disabled: laster || Boolean(error),
            }
      }
    >
      {laster ? (
        <Page.Loading label="Laster kunngjøringer" />
      ) : error ? (
        <Page.State>
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
        </Page.State>
      ) : (
        <>
          <Collection
            icon={<Megaphone aria-hidden="true" />}
            title={aktiv ? "1 kunngjøring" : "Ingen kunngjøring"}
            scope="Krever bekreftelse"
          >
            {aktiv ? (
              <Collection.List>
                <Collection.Row
                  title={aktiv.tittel}
                  description={`${aktiv.antallBekreftelser} av ${aktiv.antallMålgruppe} bekreftet`}
                  meta={`Utløper ${formatDatoKort(aktiv.utløperTidspunkt)}`}
                  status={{ label: "Aktiv", tone: "available" }}
                  interaction={{ type: "open", onOpen: () => setDetailsOpen(true) }}
                />
              </Collection.List>
            ) : (
              <RecordListState
                icon={<Megaphone aria-hidden="true" />}
                title="Klar for neste beskjed"
                description="Opprett en kunngjøring når alle brukere må lese viktig informasjon."
              />
            )}
          </Collection>

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
      )}
    </Page>
  );
}
