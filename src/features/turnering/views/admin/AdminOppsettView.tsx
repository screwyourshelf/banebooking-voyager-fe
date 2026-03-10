import { useState } from "react";
import { useOppdaterTurneringStatus } from "../../hooks/turnering/useOppdaterTurneringStatus";
import { useLeggTilKlasse } from "../../hooks/turnering/useLeggTilKlasse";
import { useFjernKlasse } from "../../hooks/turnering/useFjernKlasse";
import { useAnsvarlige } from "../../hooks/admin/useAnsvarlige";
import { useAnsvarligMutations } from "../../hooks/admin/useAnsvarligMutations";
import { nesteStatus } from "./adminStatusUtils";
import AdminOppsettContent from "./AdminOppsettContent";
import type { TurneringRespons, KlasseType } from "@/types";

type Props = {
  turnering: TurneringRespons;
};

export default function AdminOppsettView({ turnering }: Props) {
  const statusMutation = useOppdaterTurneringStatus(turnering.id);
  const leggTilKlasseMutation = useLeggTilKlasse(turnering.id);
  const fjernKlasseMutation = useFjernKlasse(turnering.id);
  const { data: ansvarligeData } = useAnsvarlige(turnering.id);
  const { leggTil: leggTilAnsvarlig, fjern: fjernAnsvarlig } = useAnsvarligMutations(turnering.id);

  const [leggTilKlasseOpen, setLeggTilKlasseOpen] = useState(false);
  const [nyAnsvarligBrukerId, setNyAnsvarligBrukerId] = useState("");

  const neste = nesteStatus(turnering.status);
  const eksisterendeKlasseTyper: KlasseType[] = turnering.klasser.map((k) => k.klasseType);

  return (
    <AdminOppsettContent
      turnering={turnering}
      eksisterendeKlasseTyper={eksisterendeKlasseTyper}
      neste={neste}
      onNesteStatus={() => statusMutation.mutate({ nyStatus: neste! })}
      nesteStatusPending={statusMutation.isPending}
      fjernKlasseError={fjernKlasseMutation.error?.message ?? null}
      onFjernKlasse={(klasseId) => fjernKlasseMutation.mutate({ klasseId })}
      fjernKlassePending={fjernKlasseMutation.isPending}
      leggTilKlasseOpen={leggTilKlasseOpen}
      onLeggTilKlasseOpen={setLeggTilKlasseOpen}
      onLeggTilKlasse={(payload) =>
        leggTilKlasseMutation.mutate(payload, {
          onSuccess: () => setLeggTilKlasseOpen(false),
        })
      }
      leggTilKlassePending={leggTilKlasseMutation.isPending}
      leggTilKlasseError={leggTilKlasseMutation.error?.message ?? null}
      ansvarlige={ansvarligeData?.ansvarlige ?? []}
      fjernAnsvarligError={fjernAnsvarlig.error?.message ?? null}
      onFjernAnsvarlig={(brukerId) => fjernAnsvarlig.mutate({ brukerId })}
      fjernAnsvarligPending={fjernAnsvarlig.isPending}
      leggTilAnsvarligError={leggTilAnsvarlig.error?.message ?? null}
      onLeggTilAnsvarlig={() => {
        if (!nyAnsvarligBrukerId.trim()) return;
        leggTilAnsvarlig.mutate(
          { brukerId: nyAnsvarligBrukerId.trim() },
          { onSuccess: () => setNyAnsvarligBrukerId("") }
        );
      }}
      leggTilAnsvarligPending={leggTilAnsvarlig.isPending}
      nyAnsvarligBrukerId={nyAnsvarligBrukerId}
      onNyAnsvarligBrukerIdChange={setNyAnsvarligBrukerId}
    />
  );
}
