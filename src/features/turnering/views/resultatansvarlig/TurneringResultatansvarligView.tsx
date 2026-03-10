import type { TurneringRespons } from "@/types";
import ResultatansvarligKampView from "./ResultatansvarligKampView";
import TurneringResultatansvarligContent from "./TurneringResultatansvarligContent";

type Props = {
  turnering: TurneringRespons;
};

export default function TurneringResultatansvarligView({ turnering }: Props) {
  const { status } = turnering;

  if (status === "DrawPublisert" || status === "Pagaar")
    return <ResultatansvarligKampView turnering={turnering} />;

  return <TurneringResultatansvarligContent turnering={turnering} />;
}
