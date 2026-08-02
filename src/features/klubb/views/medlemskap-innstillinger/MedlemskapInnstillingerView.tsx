import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { AdminPageLoading, AdminPageState } from "@/components/admin";
import { RecordListState } from "@/components/records";
import { Button } from "@/components/ui/button";
import { useMedlemskapAdmin } from "@/features/klubb/hooks/useMedlemskapAdmin";

import MedlemskapInnstillingerContent from "./MedlemskapInnstillingerContent";

export default function MedlemskapInnstillingerView() {
  const {
    status,
    laster,
    isFetching,
    error,
    refetch,
    aktiver,
    aktiverLaster,
    aktiverFeil,
    deaktiver,
    deaktiverLaster,
    deaktiverFeil,
  } = useMedlemskapAdmin();

  const [label, setLabel] = useState("");
  const [gyldigTil, setGyldigTil] = useState("");

  const handleAktiver = async () => {
    const trimmed = label.trim();
    if (!trimmed || !gyldigTil) return;
    try {
      await aktiver({ label: trimmed, gyldigTil: new Date(gyldigTil).toISOString() });
      setLabel("");
      setGyldigTil("");
    } catch {
      // Feilen vises i skjemaet.
    }
  };

  const handleDeaktiver = async () => {
    try {
      await deaktiver();
    } catch {
      // Feilen vises i skjemaet.
    }
  };

  if (laster) return <AdminPageLoading label="Laster medlemsinnstillinger" />;

  if (error) {
    return (
      <AdminPageState>
        <RecordListState
          icon={<RefreshCw aria-hidden="true" />}
          title="Kunne ikke laste status for medlemsbekreftelse"
          description={error.message}
          tone="danger"
          role="alert"
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              {isFetching ? "Prøver igjen…" : "Prøv igjen"}
            </Button>
          }
        />
      </AdminPageState>
    );
  }

  return (
    <MedlemskapInnstillingerContent
      status={status}
      label={label}
      onLabelChange={setLabel}
      gyldigTil={gyldigTil}
      onGyldigTilChange={setGyldigTil}
      onAktiver={() => void handleAktiver()}
      aktiverLaster={aktiverLaster}
      aktiverFeil={aktiverFeil?.message ?? null}
      onDeaktiver={() => void handleDeaktiver()}
      deaktiverLaster={deaktiverLaster}
      deaktiverFeil={deaktiverFeil?.message ?? null}
    />
  );
}
