import { LoaderSkeleton } from "@/components/loading";
import { useKommendeArrangementer } from "./useKommendeArrangementer";

import KommendeArrangementerContent from "./KommendeArrangementerContent";

export default function KommendeArrangementerView() {
  const { data: arrangementer = [], isLoading } = useKommendeArrangementer();

  if (isLoading) return <LoaderSkeleton />;

  return <KommendeArrangementerContent arrangementer={arrangementer} />;
}
