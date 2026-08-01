import { useState } from "react";
import { Plus, ShieldX } from "lucide-react";
import { AdminPage, AdminPageLoading, AdminPageState } from "@/components/admin";
import { RecordListState } from "@/components/records";
import { Button } from "@/components/ui/button";
import NyGrenDialog from "@/features/grener/views/ny-gren/NyGrenDialog";
import RedigerGrenView from "@/features/grener/views/rediger-gren/RedigerGrenView";
import { useBruker } from "@/hooks/useBruker";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";

export default function GrenerPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { bruker, laster } = useBruker();
  const canAdministerActivities = harHandling(bruker?.kapabiliteter, Kapabiliteter.grener.admin);

  return (
    <AdminPage
      eyebrow="Administrasjon"
      title="Grener"
      description="Administrer aktiviteter og standardregler for booking."
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
      ) : !canAdministerActivities ? (
        <AdminPageState>
          <RecordListState
            icon={<ShieldX aria-hidden="true" />}
            title="Du har ikke tilgang til Grener"
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
    </AdminPage>
  );
}
