import { ShieldX } from "lucide-react";
import { useState } from "react";
import { Page } from "@/components";

import { RecordListState } from "@/components/records";
import BanerOgGrenerWorkspace from "@/features/baner-og-grener/components/BanerOgGrenerWorkspace";
import { useBruker } from "@/hooks/useBruker";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";

import RedigerBaneView from "@/features/baner/views/rediger-bane/RedigerBaneView";
import NyBaneDialog from "@/features/baner/views/ny-bane/NyBaneDialog";

export default function BanerPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { bruker, laster, feil, isFetching, refetch } = useBruker();
  const canAdministerCourts = harHandling(bruker?.kapabiliteter, Kapabiliteter.baner.admin);
  const canAdministerActivities = harHandling(bruker?.kapabiliteter, Kapabiliteter.grener.admin);

  return (
    <BanerOgGrenerWorkspace
      activeSection="baner"
      availableSections={{
        baner: canAdministerCourts,
        grener: canAdministerActivities,
      }}
      createAction={
        canAdministerCourts ? { label: "Ny bane", onClick: () => setCreateOpen(true) } : undefined
      }
    >
      {laster ? (
        <Page.Loading label="Kontrollerer tilgang" />
      ) : feil ? (
        <Page.AccessError error={feil} isFetching={isFetching} onRetry={() => void refetch()} />
      ) : !canAdministerCourts ? (
        <Page.State>
          <RecordListState
            icon={<ShieldX aria-hidden="true" />}
            title="Du har ikke tilgang til baner"
            description="En klubbadministrator må gi deg tilgang før du kan administrere baner."
            tone="danger"
          />
        </Page.State>
      ) : (
        <RedigerBaneView />
      )}

      {canAdministerCourts ? <NyBaneDialog open={createOpen} onOpenChange={setCreateOpen} /> : null}
    </BanerOgGrenerWorkspace>
  );
}
