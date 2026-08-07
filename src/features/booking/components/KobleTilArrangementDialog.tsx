import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
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
    <Dialog open={dialog.open} onOpenChange={dialog.handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            dialog.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Koble til arrangement</DialogTitle>
            <DialogDescription>
              Velg hvilket aktivt arrangement tiden skal høre til.
            </DialogDescription>
          </DialogHeader>

          <ArrangementSelection
            arrangementer={dialog.arrangementer}
            valgtArrangementId={dialog.valgtArrangementId}
            isLoading={dialog.isLoading}
            isFetching={dialog.isFetching}
            error={dialog.error}
            onArrangementChange={dialog.handleArrangementChange}
            onRetry={() => void dialog.refetch()}
          />

          <DialogFooter>
            <Button
              type="submit"
              disabled={!dialog.valgtArrangementId || dialog.isLoading || Boolean(dialog.error)}
            >
              Koble til valgt arrangement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
    return (
      <div className="space-y-3" aria-label="Laster arrangementer">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle aria-hidden="true" />
        <AlertTitle>Kunne ikke laste arrangementene</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>{error.message}</p>
          <Button type="button" variant="outline" size="sm" onClick={onRetry} disabled={isFetching}>
            {isFetching ? "Prøver igjen…" : "Prøv igjen"}
          </Button>
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
    <RadioGroup
      value={valgtArrangementId ?? ""}
      onValueChange={onArrangementChange}
      className="gap-3"
      aria-label="Aktive arrangementer"
    >
      {arrangementer.map((arrangement) => {
        const id = `arrangement-${arrangement.id}`;
        return (
          <Label
            key={arrangement.id}
            htmlFor={id}
            className="flex cursor-pointer items-start gap-3 rounded-2xl border p-4 has-data-checked:border-primary/30 has-data-checked:bg-primary/5"
          >
            <RadioGroupItem id={id} value={arrangement.id} className="mt-0.5" />
            <span className="grid gap-1">
              <span className="font-medium">{arrangement.tittel}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {arrangement.beskrivelse || "Aktivt arrangement"}
              </span>
            </span>
          </Label>
        );
      })}
    </RadioGroup>
  );
}
