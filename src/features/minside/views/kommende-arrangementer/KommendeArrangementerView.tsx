import { LoaderSkeleton } from "@/components/loading";
import { useSearchParams } from "react-router-dom";
import { useKommendeArrangementer } from "./useKommendeArrangementer";
import { useArrangementPaamelding } from "./useArrangementPaamelding";
import { useAvlysArrangement } from "./useAvlysArrangement";

import KommendeArrangementerContent from "./KommendeArrangementerContent";

export default function KommendeArrangementerView() {
  const [searchParams] = useSearchParams();
  const { data: arrangementer = [], isLoading } = useKommendeArrangementer();
  const { onMeldPaa, onMeldAv } = useArrangementPaamelding();
  const { onAvlys } = useAvlysArrangement();

  if (isLoading) return <LoaderSkeleton />;

  const defaultArrangementId = searchParams.get("arrangement") ?? undefined;

  return (
    <KommendeArrangementerContent
      arrangementer={arrangementer}
      onMeldPaa={onMeldPaa}
      onMeldAv={onMeldAv}
      onAvlys={onAvlys}
      defaultArrangementId={defaultArrangementId}
    />
  );
}
