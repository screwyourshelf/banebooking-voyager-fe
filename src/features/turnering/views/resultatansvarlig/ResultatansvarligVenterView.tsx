import { TurneringHeaderSection } from "../../components";
import type { TurneringRespons } from "@/types";
import { Section } from "@/components";

type Props = { turnering: TurneringRespons };

export default function ResultatansvarligVenterView({ turnering }: Props) {
  return (
    <div>
      <TurneringHeaderSection
        tittel={turnering.arrangementTittel}
        status={turnering.status}
        startDato={turnering.arrangementStartDato}
        sluttDato={turnering.arrangementSluttDato}
      />
      <Section>
        <p>Kampregistrering er tilgjengelig når draw er klart.</p>
      </Section>
    </div>
  );
}
