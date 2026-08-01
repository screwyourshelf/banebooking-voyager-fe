import { useState } from "react";
import { Plus, ShieldX } from "lucide-react";
import { AdminPage, AdminPageLoading, AdminPageState } from "@/components/admin";
import { RecordListState } from "@/components/records";
import { Button } from "@/components/ui/button";
import { useBruker } from "@/hooks/useBruker";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";

import RedigerBaneView from "@/features/baner/views/rediger-bane/RedigerBaneView";
import NyBaneDialog from "@/features/baner/views/ny-bane/NyBaneDialog";

export default function BanerPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { bruker, laster } = useBruker();
  const canAdministerCourts = harHandling(bruker?.kapabiliteter, Kapabiliteter.baner.admin);

  return (
    <AdminPage
      eyebrow="Administrasjon"
      title="Baner"
      description="Hold baneoversikten oppdatert og tilpass bookingregler ved behov."
      action={
        canAdministerCourts ? (
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            Ny bane
          </Button>
        ) : null
      }
    >
      {laster ? (
        <AdminPageLoading label="Kontrollerer tilgang" />
      ) : !canAdministerCourts ? (
        <AdminPageState>
          <RecordListState
            icon={<ShieldX aria-hidden="true" />}
            title="Du har ikke tilgang til Baner"
            description="En klubbadministrator må gi deg tilgang før du kan administrere baner."
            tone="danger"
          />
        </AdminPageState>
      ) : (
        <RedigerBaneView />
      )}

      {canAdministerCourts ? <NyBaneDialog open={createOpen} onOpenChange={setCreateOpen} /> : null}
    </AdminPage>
  );
}
