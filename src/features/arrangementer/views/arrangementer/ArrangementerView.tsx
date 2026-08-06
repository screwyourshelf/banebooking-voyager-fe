import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { RecordCollectionPage } from "@/components/records";

import ArrangementerContent from "./ArrangementerContent";
import { useArrangementer } from "./useArrangementer";
import { useAvlysArrangement } from "./useAvlysArrangement";

export default function ArrangementerView() {
  const [searchParams] = useSearchParams();
  const [visHistoriske, setVisHistoriske] = useState(false);

  const {
    data: arrangementer = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useArrangementer(visHistoriske);
  const { onAvlys } = useAvlysArrangement();
  const defaultArrangementId = searchParams.get("arrangement") ?? undefined;

  return (
    <RecordCollectionPage
      eyebrow="Klubben"
      title="Arrangementer"
      description="Se hva som skjer, når det starter og hvilke baner som brukes."
    >
      <ArrangementerContent
        visHistoriske={visHistoriske}
        onToggleVisHistoriske={setVisHistoriske}
        arrangementer={arrangementer}
        isLoading={isLoading}
        queryError={error?.message ?? null}
        isFetching={isFetching}
        onRetry={() => void refetch()}
        onAvlys={onAvlys}
        defaultArrangementId={defaultArrangementId}
      />
    </RecordCollectionPage>
  );
}
