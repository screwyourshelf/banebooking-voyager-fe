import { useState } from "react";
import { useOppdaterTurneringStatus } from "../../hooks/turnering/useOppdaterTurneringStatus";
import { useLeggTilKlasse } from "../../hooks/turnering/useLeggTilKlasse";
import { useFjernKlasse } from "../../hooks/turnering/useFjernKlasse";
import { useOppdaterKlasseStruktur } from "../../hooks/turnering/useOppdaterKlasseStruktur";
import { useAnsvarlige } from "../../hooks/admin/useAnsvarlige";
import { useAnsvarligMutations } from "../../hooks/admin/useAnsvarligMutations";
import { useAdminBrukere } from "@/features/brukere/hooks/useAdminBrukere";
import { nesteStatus } from "./adminStatusUtils";
import AdminOppsettContent from "./AdminOppsettContent";
import type { TurneringRespons, KlasseType, TurneringKlasseRespons } from "@/types";

type Props = {
  turnering: TurneringRespons;
};

export default function AdminOppsettView({ turnering }: Props) {
  const statusMutation = useOppdaterTurneringStatus(turnering.id);
  const leggTilKlasseMutation = useLeggTilKlasse(turnering.id);
  const fjernKlasseMutation = useFjernKlasse(turnering.id);
  const oppdaterKlasseStrukturMutation = useOppdaterKlasseStruktur(turnering.id);
  const { data: ansvarligeData } = useAnsvarlige(turnering.id);
  const { leggTil: leggTilAnsvarlig, fjern: fjernAnsvarlig } = useAnsvarligMutations(turnering.id);

  const { brukere } = useAdminBrukere();

  const [leggTilKlasseOpen, setLeggTilKlasseOpen] = useState(false);
  const [redigerKlasse, setRedigerKlasse] = useState<TurneringKlasseRespons | null>(null);
  const [valgtBrukerId, setValgtBrukerId] = useState("");

  const ansvarligeIds = new Set(ansvarligeData?.ansvarlige.map((a) => a.brukerId) ?? []);
  const tilgjengeligeBrukere = brukere.filter((b) => !ansvarligeIds.has(b.id));

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
      redigerKlasse={redigerKlasse}
      onRedigerKlasse={setRedigerKlasse}
      onOppdaterKlasseStruktur={(payload) =>
        oppdaterKlasseStrukturMutation.mutate(
          { klasseId: redigerKlasse!.id, ...payload },
          { onSuccess: () => setRedigerKlasse(null) }
        )
      }
      oppdaterKlasseStrukturPending={oppdaterKlasseStrukturMutation.isPending}
      oppdaterKlasseStrukturError={oppdaterKlasseStrukturMutation.error?.message ?? null}
      ansvarlige={ansvarligeData?.ansvarlige ?? []}
      fjernAnsvarligError={fjernAnsvarlig.error?.message ?? null}
      onFjernAnsvarlig={(brukerId) => fjernAnsvarlig.mutate({ brukerId })}
      fjernAnsvarligPending={fjernAnsvarlig.isPending}
      leggTilAnsvarligError={leggTilAnsvarlig.error?.message ?? null}
      onLeggTilAnsvarlig={() => {
        if (!valgtBrukerId) return;
        leggTilAnsvarlig.mutate(
          { brukerId: valgtBrukerId },
          { onSuccess: () => setValgtBrukerId("") }
        );
      }}
      leggTilAnsvarligPending={leggTilAnsvarlig.isPending}
      brukere={tilgjengeligeBrukere}
      valgtBrukerId={valgtBrukerId}
      onVelgBrukerIdChange={setValgtBrukerId}
    />
  );
}
