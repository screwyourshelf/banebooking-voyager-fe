import { useState } from "react";
import { Plus, ShieldX } from "lucide-react";
import { AdminAccessError, AdminPageLoading, AdminPageState } from "@/components/admin";
import { RecordListState } from "@/components/records";
import { Button } from "@/components/ui/button";
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
      action={
        canAdministerActivities ? (
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            Ny gren
          </Button>
        ) : null
      }
    >
      {laster ? (
        <AdminPageLoading label="Kontrollerer tilgang" />
      ) : feil ? (
        <AdminAccessError feil={feil} isFetching={isFetching} onRetry={() => void refetch()} />
      ) : !canAdministerActivities ? (
        <AdminPageState>
          <RecordListState
            icon={<ShieldX aria-hidden="true" />}
            title="Du har ikke tilgang til grener"
            description="En klubbadministrator må gi deg tilgang før du kan administrere grener."
            tone="danger"
          />
        </AdminPageState>
      ) : (
        <RedigerGrenView />
      )}

      {canAdministerActivities ? (
        <NyGrenDialog open={createOpen} onOpenChange={setCreateOpen} />
      ) : null}
    </BanerOgGrenerWorkspace>
  );
}
