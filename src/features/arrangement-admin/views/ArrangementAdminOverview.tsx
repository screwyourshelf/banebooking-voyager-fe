import { useMemo, useState } from "react";
import { ArrowLeft, CalendarCog, CalendarX2, ChevronRight, SlidersHorizontal } from "lucide-react";

import { ActionFeedback, type ActionFeedbackMessage } from "@/components/feedback";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { ArrangementRespons } from "@/types";
import { formaterArrangementKategori } from "@/utils/arrangementPresentation";
import { useRedigerArrangement } from "../hooks/useRedigerArrangement";
import OpprettArrangementView from "./arrangement/OpprettArrangementView";
import RedigerArrangementView from "./rediger-arrangement/RedigerArrangementView";

type Props = {
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
};

function parseLocalDate(value: string) {
  return new Date(`${value.slice(0, 10)}T00:00:00`);
}

function formatDate(value: string, includeYear = false) {
  return parseLocalDate(value).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    ...(includeYear ? { year: "numeric" } : {}),
  });
}

function formatDateRange(arrangement: ArrangementRespons) {
  const currentYear = new Date().getFullYear();
  const startYear = parseLocalDate(arrangement.startDato).getFullYear();
  const endYear = parseLocalDate(arrangement.sluttDato).getFullYear();
  const start = formatDate(
    arrangement.startDato,
    startYear !== currentYear || startYear !== endYear
  );

  if (arrangement.startDato === arrangement.sluttDato) return start;
  return `${start}–${formatDate(arrangement.sluttDato, endYear !== currentYear)}`;
}

function getStatus(arrangement: ArrangementRespons) {
  if (arrangement.erPassert) return { label: "Gjennomført", variant: "secondary" as const };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = parseLocalDate(arrangement.startDato);
  const end = parseLocalDate(arrangement.sluttDato);

  return start <= today && today <= end
    ? { label: "Pågår", variant: "default" as const }
    : { label: "Kommende", variant: "outline" as const };
}

export default function ArrangementAdminOverview({ createOpen, onCreateOpenChange }: Props) {
  const [showPast, setShowPast] = useState(false);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creationFeedback, setCreationFeedback] = useState<ActionFeedbackMessage | null>(null);
  const {
    arrangementer = [],
    arrangementerFeil,
    refetchArrangementer,
    grener,
    isLoading,
    isLoadingArrangementer,
  } = useRedigerArrangement(null, "");

  const visibleArrangements = useMemo(
    () =>
      arrangementer.filter(
        (arrangement) =>
          (showPast || !arrangement.erPassert) &&
          (selectedBranches.length === 0 || selectedBranches.includes(arrangement.grenSlug))
      ),
    [arrangementer, selectedBranches, showPast]
  );
  const selectedArrangement = arrangementer.find((arrangement) => arrangement.id === selectedId);
  const isLoadingOverview = isLoading || isLoadingArrangementer;

  return (
    <>
      <div className="space-y-5">
        {creationFeedback ? <ActionFeedback {...creationFeedback} /> : null}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarCog className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-medium tracking-tight">
                {visibleArrangements.length} arrangement
                {visibleArrangements.length === 1 ? "" : "er"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {showPast ? "Alle arrangementer" : "Aktive og kommende arrangementer"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex h-9 items-center gap-2 rounded-xl border bg-background px-3 text-sm font-medium shadow-xs">
              <Checkbox
                checked={showPast}
                onCheckedChange={(checked) => setShowPast(checked === true)}
                disabled={isLoadingOverview}
              />
              Vis tidligere
            </label>

            {grener.length > 1 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    <SlidersHorizontal data-icon="inline-start" aria-hidden="true" />
                    Gren
                    {selectedBranches.length > 0 ? (
                      <Badge variant="secondary">{selectedBranches.length}</Badge>
                    ) : null}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filtrer på gren</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {grener.map((gren) => (
                    <DropdownMenuCheckboxItem
                      key={gren.slug}
                      checked={selectedBranches.includes(gren.slug)}
                      onCheckedChange={() =>
                        setSelectedBranches((current) =>
                          current.includes(gren.slug)
                            ? current.filter((branch) => branch !== gren.slug)
                            : [...current, gren.slug]
                        )
                      }
                    >
                      {gren.navn}
                    </DropdownMenuCheckboxItem>
                  ))}
                  {selectedBranches.length > 0 ? (
                    <>
                      <DropdownMenuSeparator />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSelectedBranches([])}
                      >
                        Nullstill filter
                      </Button>
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>

        {isLoadingOverview ? (
          <div className="space-y-2" aria-label="Laster arrangementer">
            {[0, 1, 2, 3].map((row) => (
              <Skeleton key={row} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : arrangementerFeil ? (
          <Alert variant="destructive">
            <CalendarX2 aria-hidden="true" />
            <AlertTitle>Kunne ikke laste arrangementene</AlertTitle>
            <AlertDescription className="flex flex-col items-start gap-3">
              <span>{arrangementerFeil.message}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void refetchArrangementer()}
              >
                Prøv igjen
              </Button>
            </AlertDescription>
          </Alert>
        ) : visibleArrangements.length === 0 ? (
          <Card className="border-dashed bg-muted/20 shadow-none">
            <CardHeader className="items-center py-10 text-center">
              <div className="flex size-11 items-center justify-center rounded-full bg-muted">
                <CalendarX2 className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <CardTitle>
                {showPast ? "Ingen arrangementer ennå" : "Ingen aktive arrangementer"}
              </CardTitle>
              <CardDescription>
                {showPast
                  ? "Opprett et arrangement for å legge til tider."
                  : "Vis tidligere eller opprett et nytt arrangement."}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card className="gap-0 py-0">
            <CardContent className="px-0">
              <div className="hidden grid-cols-[minmax(0,1fr)_9rem_8rem_2rem] gap-4 border-b px-5 py-3 text-xs font-medium text-muted-foreground md:grid">
                <span>Arrangement</span>
                <span>Dato</span>
                <span>Status</span>
                <span className="sr-only">Åpne</span>
              </div>
              <div className="divide-y">
                {visibleArrangements.map((arrangement) => {
                  const status = getStatus(arrangement);
                  const metadata = [
                    arrangement.grenNavn,
                    formaterArrangementKategori(arrangement.kategori),
                  ]
                    .filter(Boolean)
                    .join(" · ");

                  return (
                    <button
                      key={arrangement.id}
                      type="button"
                      className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset md:grid-cols-[minmax(0,1fr)_9rem_8rem_2rem] md:px-5"
                      aria-label={`Rediger ${arrangement.tittel}, ${formatDateRange(arrangement)}`}
                      onClick={() => setSelectedId(arrangement.id)}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-heading text-base font-medium">
                          {arrangement.tittel}
                        </span>
                        <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                          {metadata}
                        </span>
                      </span>
                      <ChevronRight
                        className="size-4 text-muted-foreground md:order-last"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium md:col-auto md:row-auto">
                        {formatDateRange(arrangement)}
                      </span>
                      <Badge variant={status.variant} className="w-fit md:col-auto md:row-auto">
                        {status.label}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Sheet open={createOpen} onOpenChange={onCreateOpenChange}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full! overflow-y-auto p-0 sm:max-w-3xl! lg:max-w-5xl!"
        >
          <SheetHeader className="sticky top-0 z-10 gap-3 border-b bg-sidebar px-4 py-5 text-sidebar-foreground sm:px-6">
            <SheetClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-fit text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <ArrowLeft data-icon="inline-start" aria-hidden="true" />
                Alle arrangementer
              </Button>
            </SheetClose>
            <div className="space-y-1 text-left">
              <Badge className="bg-sidebar-accent text-sidebar-accent-foreground">
                Nytt arrangement
              </Badge>
              <SheetTitle className="text-2xl text-sidebar-foreground sm:text-3xl">
                Opprett arrangement
              </SheetTitle>
              <SheetDescription className="text-sidebar-foreground/70">
                Legg inn informasjon og bygg listen over banetider.
              </SheetDescription>
            </div>
          </SheetHeader>
          <div className="p-4 sm:p-6">
            <OpprettArrangementView
              onCreated={(feedback) => {
                setCreationFeedback(feedback);
                onCreateOpenChange(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full! overflow-y-auto p-0 sm:max-w-3xl! lg:max-w-5xl!"
        >
          <SheetHeader className="sticky top-0 z-10 gap-3 border-b bg-sidebar px-4 py-5 text-sidebar-foreground sm:px-6">
            <SheetClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-fit text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <ArrowLeft data-icon="inline-start" aria-hidden="true" />
                Alle arrangementer
              </Button>
            </SheetClose>
            <div className="space-y-1 text-left">
              <Badge className="bg-sidebar-accent text-sidebar-accent-foreground">
                Rediger arrangement
              </Badge>
              <SheetTitle className="text-2xl text-sidebar-foreground sm:text-3xl">
                {selectedArrangement?.tittel ?? "Arrangement"}
              </SheetTitle>
              <SheetDescription className="text-sidebar-foreground/70">
                {selectedArrangement
                  ? `${formatDateRange(selectedArrangement)} · ${selectedArrangement.grenNavn}`
                  : "Laster arrangementet."}
              </SheetDescription>
            </div>
          </SheetHeader>
          <div className="p-4 sm:p-6">
            {selectedId ? (
              <RedigerArrangementView
                arrangementId={selectedId}
                onDeleted={() => setSelectedId(null)}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
