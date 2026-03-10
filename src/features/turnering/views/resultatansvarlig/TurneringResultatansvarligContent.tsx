import PageSection from "@/components/sections/PageSection";
import { TurneringHeaderSection } from "../../components";
import { STATUS_LABELS } from "../admin/adminStatusUtils";
import type { TurneringRespons } from "@/types";

type Props = {
  turnering: TurneringRespons;
};

export default function TurneringResultatansvarligContent({ turnering }: Props) {
  return (
    <div className="space-y-4">
      <TurneringHeaderSection
        tittel={turnering.arrangementTittel}
        status={turnering.status}
        beskrivelse={turnering.arrangementBeskrivelse}
        startDato={turnering.arrangementStartDato}
        sluttDato={turnering.arrangementSluttDato}
      />
      <PageSection>
        <p className="text-sm text-muted-foreground italic">
          Turneringen er i status «{STATUS_LABELS[turnering.status]}». Det er ikke noe å gjøre her
          ennå.
        </p>
      </PageSection>
    </div>
  );
}
