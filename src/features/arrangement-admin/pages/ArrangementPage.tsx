import { useState } from "react";
import { Plus, ShieldX } from "lucide-react";
import { AdminPage, AdminPageLoading, AdminPageState } from "@/components/admin";
import { RecordListState } from "@/components/records";
import { Button } from "@/components/ui/button";
import ArrangementAdminOverview from "@/features/arrangement-admin/views/ArrangementAdminOverview";
import { useBruker } from "@/hooks/useBruker";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";

export default function ArrangementPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { bruker, laster } = useBruker();
  const canManageArrangements = harHandling(bruker?.kapabiliteter, Kapabiliteter.arrangement.se);

  return (
    <AdminPage
      eyebrow="Administrasjon"
      title="Arrangementer"
      description="Opprett arrangementer og administrer informasjon, turnering og bookede tider."
      action={
        canManageArrangements ? (
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            Nytt arrangement
          </Button>
        ) : null
      }
    >
      {laster ? (
        <AdminPageLoading label="Kontrollerer tilgang" />
      ) : !canManageArrangements ? (
        <AdminPageState>
          <RecordListState
            icon={<ShieldX aria-hidden="true" />}
            title="Du har ikke tilgang til arrangementadministrasjon"
            description="En klubbadministrator må gi deg tilgang før du kan administrere arrangementer."
            tone="danger"
          />
        </AdminPageState>
      ) : (
        <ArrangementAdminOverview createOpen={createOpen} onCreateOpenChange={setCreateOpen} />
      )}
    </AdminPage>
  );
}
