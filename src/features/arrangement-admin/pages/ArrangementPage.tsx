import { ShieldX } from "lucide-react";
import { useState } from "react";
import { Page } from "@/components";

import { RecordListState } from "@/components/records";
import ArrangementAdminOverview from "@/features/arrangement-admin/views/ArrangementAdminOverview";
import { useBruker } from "@/hooks/useBruker";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";

export default function ArrangementPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { bruker, laster, feil, isFetching, refetch } = useBruker();
  const canManageArrangements = harHandling(bruker?.kapabiliteter, Kapabiliteter.arrangement.se);

  return (
    <Page
      eyebrow="Administrasjon"
      title="Administrer arrangementer"
      description="Planlegg program, legg til banetider og styr publisering."
      createAction={
        canManageArrangements
          ? { label: "Nytt arrangement", onClick: () => setCreateOpen(true) }
          : undefined
      }
    >
      {laster ? (
        <Page.Loading label="Kontrollerer tilgang" />
      ) : feil ? (
        <Page.AccessError error={feil} isFetching={isFetching} onRetry={() => void refetch()} />
      ) : !canManageArrangements ? (
        <Page.State>
          <RecordListState
            icon={<ShieldX aria-hidden="true" />}
            title="Du har ikke tilgang til arrangementadministrasjon"
            description="En klubbadministrator må gi deg tilgang før du kan administrere arrangementer."
            tone="danger"
          />
        </Page.State>
      ) : (
        <ArrangementAdminOverview createOpen={createOpen} onCreateOpenChange={setCreateOpen} />
      )}
    </Page>
  );
}
