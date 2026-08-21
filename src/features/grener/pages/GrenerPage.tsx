import { ShieldX } from "lucide-react";
import { useState } from "react";
import { Page } from "@/components";

import { RecordListState } from "@/components/records";
import BanerOgGrenerWorkspace from "@/features/baner-og-grener/components/BanerOgGrenerWorkspace";
import NyGrenDialog from "@/features/grener/views/ny-gren/NyGrenDialog";
import RedigerGrenView from "@/features/grener/views/rediger-gren/RedigerGrenView";
import { useBruker } from "@/hooks/useBruker";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";

export default function GrenerPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { bruker, laster, feil, isFetching, refetch } = useBruker();
  const canAdministerActivities = harHandling(bruker?.kapabiliteter, Kapabiliteter.grener.admin);
  const canAdministerCourts = harHandling(bruker?.kapabiliteter, Kapabiliteter.baner.admin);

  return (
    <BanerOgGrenerWorkspace
      activeSection="grener"
      availableSections={{
        baner: canAdministerCourts,
        grener: canAdministerActivities,
      }}
      createAction={
        canAdministerActivities
          ? { label: "Ny gren", onClick: () => setCreateOpen(true) }
          : undefined
      }
    >
      {laster ? (
        <Page.Loading label="Kontrollerer tilgang" />
      ) : feil ? (
        <Page.AccessError error={feil} isFetching={isFetching} onRetry={() => void refetch()} />
      ) : !canAdministerActivities ? (
        <Page.State>
          <RecordListState
            icon={<ShieldX aria-hidden="true" />}
            title="Du har ikke tilgang til grener"
            description="En klubbadministrator må gi deg tilgang før du kan administrere grener."
            tone="danger"
          />
        </Page.State>
      ) : (
        <RedigerGrenView />
      )}

      {canAdministerActivities ? (
        <NyGrenDialog open={createOpen} onOpenChange={setCreateOpen} />
      ) : null}
    </BanerOgGrenerWorkspace>
  );
}
