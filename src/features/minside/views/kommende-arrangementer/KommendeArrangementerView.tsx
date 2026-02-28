import { LoaderSkeleton } from "@/components/loading";
import { useKommendeArrangementer } from "./useKommendeArrangementer";
import { useArrangementPaamelding } from "./useArrangementPaamelding";
import { useAvlysArrangement } from "./useAvlysArrangement";

import KommendeArrangementerContent from "./KommendeArrangementerContent";

export default function KommendeArrangementerView() {
  const { data: arrangementer = [], isLoading } = useKommendeArrangementer();
  const { onMeldPaa, onMeldAv } = useArrangementPaamelding();
  const { onAvlys } = useAvlysArrangement();

  if (isLoading) return <LoaderSkeleton />;

  return (
    <KommendeArrangementerContent
      arrangementer={arrangementer}
      onMeldPaa={onMeldPaa}
      onMeldAv={onMeldAv}
      onAvlys={onAvlys}
    />
  );
}
