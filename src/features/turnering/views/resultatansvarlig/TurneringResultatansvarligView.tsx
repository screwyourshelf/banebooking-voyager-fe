import type { TurneringRespons } from "@/types";
import ResultatansvarligKampView from "./ResultatansvarligKampView";
import ResultatansvarligVenterView from "./ResultatansvarligVenterView";
import TurneringSpillerView from "../spiller/TurneringSpillerView";

type Props = {
  turnering: TurneringRespons;
};

export default function TurneringResultatansvarligView({ turnering }: Props) {
  const { status } = turnering;

  if (status === "Pagaar") return <ResultatansvarligKampView turnering={turnering} />;

  if (status === "Oppsett") return <ResultatansvarligVenterView turnering={turnering} />;

  return <TurneringSpillerView turnering={turnering} />;
}
