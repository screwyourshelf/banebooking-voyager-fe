import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { SettingsRadioGroup } from "@/components/admin";
import { AppDialog } from "@/components/dialogs";
import { Stack } from "@/components/layout";
import { RecordCollectionSkeleton } from "@/components/records";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useArrangementBookingDialog } from "../hooks/useArrangementBookingDialog";
import type { AktivtArrangementRespons } from "@/types";

type Props = {
  grenId: string;
  valgtId: string | null;
  onVelg: (id: string | null, tittel?: string) => void;
  children: ReactNode;
};

type SelectionProps = {
  arrangementer: AktivtArrangementRespons[];
  valgtArrangementId: string | null;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  onArrangementChange: (arrangementId: string) => void;
  onRetry: () => void;
};

export default function KobleTilArrangementDialog({ grenId, valgtId, onVelg, children }: Props) {
  const dialog = useArrangementBookingDialog({ grenId, valgtId, onVelg });

  return (
    <AppDialog
      open={dialog.open}
      onOpenChange={dialog.handleOpenChange}
      trigger={children}
      title="Koble til arrangement"
      description="Velg hvilket aktivt arrangement tiden skal høre til."
      onSubmit={(event) => {
        event.preventDefault();
        dialog.handleSubmit();
      }}
      actions={
        <Button
          type="submit"
          disabled={!dialog.valgtArrangementId || dialog.isLoading || Boolean(dialog.error)}
        >
          Koble til valgt arrangement
        </Button>
      }
    >
      <ArrangementSelection
        arrangementer={dialog.arrangementer}
        valgtArrangementId={dialog.valgtArrangementId}
        isLoading={dialog.isLoading}
        isFetching={dialog.isFetching}
        error={dialog.error}
        onArrangementChange={dialog.handleArrangementChange}
        onRetry={() => void dialog.refetch()}
      />
    </AppDialog>
  );
}

function ArrangementSelection({
  arrangementer,
  valgtArrangementId,
  isLoading,
  isFetching,
  error,
  onArrangementChange,
  onRetry,
}: SelectionProps) {
  if (isLoading) {
    return <RecordCollectionSkeleton ariaLabel="Laster arrangementer" rows={2} />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle aria-hidden="true" />
        <AlertTitle>Kunne ikke laste arrangementene</AlertTitle>
        <AlertDescription>
          <Stack gap="sm">
            <p>{error.message}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isFetching}
            >
              {isFetching ? "Prøver igjen…" : "Prøv igjen"}
            </Button>
          </Stack>
        </AlertDescription>
      </Alert>
    );
  }

  if (arrangementer.length === 0) {
    return (
      <Alert>
        <AlertTitle>Ingen aktive arrangementer</AlertTitle>
        <AlertDescription>
          Opprett eller aktiver et arrangement før du kobler tiden til det.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <SettingsRadioGroup
      label="Aktive arrangementer"
      value={valgtArrangementId ?? ""}
      onValueChange={onArrangementChange}
      layout="stacked"
      options={arrangementer.map((arrangement) => ({
        value: arrangement.id,
        label: arrangement.tittel,
        description: arrangement.beskrivelse || "Aktivt arrangement",
      }))}
    />
  );
}
