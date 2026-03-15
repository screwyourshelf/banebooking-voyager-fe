import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  klasseTypeNavn,
  GenererDrawDialog,
  KlasseKampTab,
  type KlasseKampTabContext,
} from "../../components";
import { useOppdaterTurneringStatus } from "../../hooks/turnering/useOppdaterTurneringStatus";
import { useGenererDraw } from "../../hooks/draw/useGenererDraw";
import { useFrøSluttspill } from "../../hooks/draw/useFrøSluttspill";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { nesteStatus } from "./adminStatusUtils";
import AdminKampgjennomforingContent from "./AdminKampgjennomforingContent";
import type { TurneringRespons, TurneringKlasseRespons } from "@/types";

type AdminKampActionsProps = {
  turneringId: string;
  klasse: TurneringKlasseRespons;
  ctx: KlasseKampTabContext;
};

function AdminKampActions({ turneringId, klasse, ctx }: AdminKampActionsProps) {
  const genererDrawMutation = useGenererDraw(turneringId, klasse.id);
  const frøSluttspillMutation = useFrøSluttspill(turneringId, klasse.id);
  const [drawDialogOpen, setDrawDialogOpen] = useState(false);
  const kanFrøSluttspill = harHandling(
    ctx.drawKapabiliteter,
    Kapabiliteter.turnering.frøSluttspill
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Handlinger</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setDrawDialogOpen(true)}
            disabled={genererDrawMutation.isPending}
          >
            {ctx.harDraw ? "Regenerer draw" : "Generer draw"}
          </DropdownMenuItem>
          {ctx.kanGenererKampplan && ctx.harDraw && (
            <DropdownMenuItem onClick={() => ctx.openKampplan()} disabled={ctx.kampplanPending}>
              Generer kampplan
            </DropdownMenuItem>
          )}
          {kanFrøSluttspill && ctx.harDraw && (
            <DropdownMenuItem
              onClick={() => frøSluttspillMutation.mutate()}
              disabled={frøSluttspillMutation.isPending || !ctx.alleGruppekamperFerdig}
            >
              Frø sluttspill
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <GenererDrawDialog
        open={drawDialogOpen}
        onOpenChange={setDrawDialogOpen}
        klasseStruktur={klasse.struktur}
        antallPaameldte={klasse.antallPaameldte}
        erRegenerer={ctx.harDraw}
        onGenerer={(payload) => {
          genererDrawMutation.mutate(payload);
          setDrawDialogOpen(false);
        }}
        isPending={genererDrawMutation.isPending}
      />
    </>
  );
}

type Props = {
  turnering: TurneringRespons;
};

export default function AdminKampgjennomforingView({ turnering }: Props) {
  const statusMutation = useOppdaterTurneringStatus(turnering.id);
  const neste = nesteStatus(turnering.status);

  const klasseTabs = turnering.klasser.map((klasse) => ({
    value: klasse.id,
    label: klasseTypeNavn(klasse.klasseType),
    content: (
      <KlasseKampTab
        key={klasse.id}
        turneringId={turnering.id}
        klasse={klasse}
        forslagStartTid={
          klasse.foreslåttStartTid ??
          (turnering.arrangementStartDato ? `${turnering.arrangementStartDato}T09:00` : null)
        }
        renderActions={(ctx) => (
          <AdminKampActions turneringId={turnering.id} klasse={klasse} ctx={ctx} />
        )}
      />
    ),
  }));

  return (
    <AdminKampgjennomforingContent
      turnering={turnering}
      neste={neste}
      onNesteStatus={() => statusMutation.mutate({ nyStatus: neste! })}
      nesteStatusPending={statusMutation.isPending}
      klasseTabs={klasseTabs}
    />
  );
}
