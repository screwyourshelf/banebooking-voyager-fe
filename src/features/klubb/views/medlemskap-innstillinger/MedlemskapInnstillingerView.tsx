import { useState } from "react";
import { FormSkeleton } from "@/components/loading";
import { QueryFeil } from "@/components/errors";
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
    await aktiver({ label: trimmed, gyldigTil: new Date(gyldigTil).toISOString() });
    setLabel("");
    setGyldigTil("");
  };

  const handleDeaktiver = async () => {
    await deaktiver();
  };

  if (laster) return <FormSkeleton />;

  return (
    <QueryFeil error={error} isFetching={isFetching} onRetry={() => void refetch()}>
      <MedlemskapInnstillingerContent
        status={status}
        label={label}
        onLabelChange={setLabel}
        gyldigTil={gyldigTil}
        onGyldigTilChange={setGyldigTil}
        onAktiver={handleAktiver}
        aktiverLaster={aktiverLaster}
        aktiverFeil={aktiverFeil?.message ?? null}
        onDeaktiver={handleDeaktiver}
        deaktiverLaster={deaktiverLaster}
        deaktiverFeil={deaktiverFeil?.message ?? null}
      />
    </QueryFeil>
  );
}
