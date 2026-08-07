import { useState } from "react";
import { CalendarDays, Plus, ShieldX } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ArrangementAdminOverview from "@/features/arrangement-admin/views/ArrangementAdminOverview";
import { useBruker } from "@/hooks/useBruker";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";

export default function ArrangementPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { bruker, laster, feil, isFetching, refetch } = useBruker();
  const canManageArrangements = harHandling(bruker?.kapabiliteter, Kapabiliteter.arrangement.se);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6 md:py-8 lg:px-8 lg:py-10">
      <div className="flex min-h-[36rem] flex-col gap-0 overflow-hidden rounded-t-3xl bg-card">
        <header className="bg-sidebar px-4 py-6 text-sidebar-foreground sm:px-6 md:px-8 md:py-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <Badge
                variant="outline"
                className="border-transparent bg-sidebar-accent text-sidebar-accent-foreground"
              >
                Administrasjon
              </Badge>
              <div className="space-y-1.5">
                <h1 className="font-heading text-page-title text-balance text-sidebar-foreground">
                  Administrer arrangementer
                </h1>
                <p className="max-w-2xl text-body text-sidebar-foreground/75 md:text-lead">
                  Planlegg program, legg til banetider og styr publisering.
                </p>
              </div>
            </div>

            {canManageArrangements ? (
              <Button type="button" variant="secondary" onClick={() => setCreateOpen(true)}>
                <Plus data-icon="inline-start" aria-hidden="true" />
                Nytt arrangement
              </Button>
            ) : null}
          </div>
        </header>

        <div className="flex-1 px-4 py-5 sm:px-6 md:px-8 md:py-8">
          {laster ? (
            <div className="space-y-4" aria-label="Kontrollerer tilgang">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-44" />
                  <Skeleton className="h-4 w-60" />
                </div>
                <Skeleton className="h-9 w-32" />
              </div>
              <Skeleton className="h-72 w-full rounded-2xl" />
            </div>
          ) : feil ? (
            <Alert variant="destructive">
              <CalendarDays aria-hidden="true" />
              <AlertTitle>Kunne ikke kontrollere tilgangen</AlertTitle>
              <AlertDescription className="flex flex-col items-start gap-3">
                <span>{feil}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void refetch()}
                  disabled={isFetching}
                >
                  {isFetching ? "Prøver igjen…" : "Prøv igjen"}
                </Button>
              </AlertDescription>
            </Alert>
          ) : !canManageArrangements ? (
            <Alert variant="destructive">
              <ShieldX aria-hidden="true" />
              <AlertTitle>Du har ikke tilgang til arrangementadministrasjon</AlertTitle>
              <AlertDescription>
                En klubbadministrator må gi deg tilgang før du kan administrere arrangementer.
              </AlertDescription>
            </Alert>
          ) : (
            <ArrangementAdminOverview createOpen={createOpen} onCreateOpenChange={setCreateOpen} />
          )}
        </div>
      </div>
    </div>
  );
}
