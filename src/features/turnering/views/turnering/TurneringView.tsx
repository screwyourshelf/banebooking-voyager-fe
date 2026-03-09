import { ListSkeleton } from "@/components/loading";
import { QueryFeil } from "@/components/errors";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";
import { useTurnering } from "../../hooks/turnering/useTurnering";
import TurneringAdminView from "../admin/TurneringAdminView";
import TurneringResultatansvarligView from "../resultatansvarlig/TurneringResultatansvarligView";
import TurneringSpillerView from "../spiller/TurneringSpillerView";
import type { TurneringRespons } from "@/types";

type TurneringRolle = "admin" | "resultatansvarlig" | "spiller";

function utledRolle(kapabiliteter: string[]): TurneringRolle {
  if (harHandling(kapabiliteter, Kapabiliteter.turnering.administrer)) return "admin";
  if (harHandling(kapabiliteter, Kapabiliteter.turnering.registrerResultat))
    return "resultatansvarlig";
  return "spiller";
}

function renderRolleView(turnering: TurneringRespons) {
  const rolle = utledRolle(turnering.kapabiliteter);
  if (rolle === "admin") return <TurneringAdminView turnering={turnering} />;
  if (rolle === "resultatansvarlig")
    return <TurneringResultatansvarligView turnering={turnering} />;
  return <TurneringSpillerView turnering={turnering} />;
}

type Props = {
  turneringId: string;
};

export default function TurneringView({ turneringId }: Props) {
  const { data, isLoading, error, refetch, isFetching } = useTurnering(turneringId);

  if (isLoading) return <ListSkeleton />;

  return (
    <QueryFeil error={error} isFetching={isFetching} onRetry={() => void refetch()}>
      {data && renderRolleView(data)}
    </QueryFeil>
  );
}
