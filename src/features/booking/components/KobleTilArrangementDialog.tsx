import type { ReactNode } from "react";
import {
  AdminEditorDialog,
  AdminFormActions,
  AdminSettingsForm,
  SettingsPanel,
  SettingsRadioGroup,
  SettingsRow,
  SettingsSection,
  SettingsStack,
} from "@/components/admin";
import { RecordListState } from "@/components/records";
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
    <AdminEditorDialog
      open={dialog.open}
      onOpenChange={dialog.handleOpenChange}
      trigger={children}
      backLabel="Til booking"
      eyebrow="Booking"
      title="Koble til arrangement"
      description="Velg hvilket aktivt arrangement tiden skal høre til."
    >
      <AdminSettingsForm
        onSubmit={(event) => {
          event.preventDefault();
          dialog.handleSubmit();
        }}
      >
        <SettingsStack>
          <SettingsSection
            title="Aktive arrangementer"
            description="Valget gjelder bare denne tiden."
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
          </SettingsSection>
        </SettingsStack>

        <AdminFormActions>
          <Button
            type="submit"
            disabled={!dialog.valgtArrangementId || dialog.isLoading || Boolean(dialog.error)}
          >
            Koble til valgt arrangement
          </Button>
        </AdminFormActions>
      </AdminSettingsForm>
    </AdminEditorDialog>
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
    return <RecordListState title="Laster arrangementer…" />;
  }

  if (error) {
    return (
      <RecordListState
        title="Kunne ikke laste arrangementene"
        description={error.message}
        tone="danger"
        role="alert"
        action={
          <Button type="button" variant="outline" size="sm" onClick={onRetry} disabled={isFetching}>
            {isFetching ? "Prøver igjen…" : "Prøv igjen"}
          </Button>
        }
      />
    );
  }

  if (arrangementer.length === 0) {
    return (
      <RecordListState
        title="Ingen aktive arrangementer"
        description="Opprett eller aktiver et arrangement før du kobler tiden til det."
      />
    );
  }

  return (
    <SettingsPanel>
      <SettingsRow title="Arrangement" description="Velg ett arrangement fra listen.">
        <SettingsRadioGroup
          label="Aktive arrangementer"
          layout="stacked"
          options={arrangementer.map(toRadioOption)}
          value={valgtArrangementId ?? ""}
          onValueChange={onArrangementChange}
        />
      </SettingsRow>
    </SettingsPanel>
  );
}

function toRadioOption(arrangement: AktivtArrangementRespons) {
  return {
    value: arrangement.id,
    label: arrangement.tittel,
    description: arrangement.beskrivelse || "Aktivt arrangement",
  };
}
