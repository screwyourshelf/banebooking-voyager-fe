import type { TurneringRespons } from "@/types";
import PageSection from "@/components/sections/PageSection";
import { TurneringStatusBadge } from "../../components";
import { STATUS_LABELS } from "../admin/adminStatusUtils";
import ResultatansvarligKampView from "./ResultatansvarligKampView";

type Props = {
  turnering: TurneringRespons;
};

export default function TurneringResultatansvarligView({ turnering }: Props) {
  const { status } = turnering;

  if (status === "DrawPublisert" || status === "Pagaar")
    return <ResultatansvarligKampView turnering={turnering} />;

  return (
    <div className="space-y-4">
      <PageSection>
        <div>
          <h2 className="text-lg font-semibold">{turnering.arrangementTittel}</h2>
          <div className="mt-1">
            <TurneringStatusBadge status={turnering.status} />
          </div>
        </div>
      </PageSection>
      <PageSection>
        <p className="text-sm text-muted-foreground italic">
          Turneringen er i status «{STATUS_LABELS[status]}». Det er ikke noe å gjøre her ennå.
        </p>
      </PageSection>
    </div>
  );
}
