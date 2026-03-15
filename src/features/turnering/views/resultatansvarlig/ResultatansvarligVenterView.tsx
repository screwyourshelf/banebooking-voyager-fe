import PageSection from "@/components/sections/PageSection";
import { TurneringHeaderSection } from "../../components";
import type { TurneringRespons } from "@/types";

type Props = { turnering: TurneringRespons };

export default function ResultatansvarligVenterView({ turnering }: Props) {
  return (
    <div className="space-y-4">
      <TurneringHeaderSection
        tittel={turnering.arrangementTittel}
        status={turnering.status}
        startDato={turnering.arrangementStartDato}
        sluttDato={turnering.arrangementSluttDato}
      />
      <PageSection>
        <p className="text-sm text-muted-foreground italic">
          Kampregistrering er tilgjengelig når draw er klart.
        </p>
      </PageSection>
    </div>
  );
}
