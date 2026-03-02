import PageSection from "@/components/sections/PageSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AccordionDetailGrid, AccordionDetailRow } from "@/components/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDatoKort, formatDayOfWeeksLangNorsk } from "@/utils/datoUtils";
import { Calendar, Clock, Link, MapPin, Users, UserCheck, CalendarPlus, XCircle, Ban } from "lucide-react";
import { SlettArrangementDialog } from "@/features/arrangement/components";
import PaameldteDialog from "./PaameldteDialog";
import { useSlug } from "@/hooks/useSlug";
import { harHandling } from "@/utils/handlingUtils";
import { toast } from "sonner";
import type { KommendeArrangementRespons } from "@/types";

type Props = {
  arrangementer: KommendeArrangementRespons[];
  onMeldPaa: (arr: KommendeArrangementRespons) => void;
  onMeldAv: (arr: KommendeArrangementRespons) => void;
  onAvlys: (arr: KommendeArrangementRespons) => Promise<unknown>;
  defaultArrangementId?: string;
};

function dagerIgjenFra(startDatoIso: string) {
  const start = new Date(startDatoIso);
  const iDag = new Date();

  const startMidnatt = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const iDagMidnatt = new Date(iDag.getFullYear(), iDag.getMonth(), iDag.getDate());

  const diffMs = startMidnatt.getTime() - iDagMidnatt.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function datoTekst(arr: KommendeArrangementRespons) {
  return arr.startDato === arr.sluttDato
    ? formatDatoKort(arr.startDato)
    : `${formatDatoKort(arr.startDato)} – ${formatDatoKort(arr.sluttDato)}`;
}

export default function KommendeArrangementerContent({
  arrangementer,
  onMeldPaa,
  onMeldAv,
  onAvlys,
  defaultArrangementId,
}: Props) {
  const slug = useSlug();

  function kopierLenke(arrangementId: string) {
    const url = `${window.location.origin}/${slug}/minside?tab=kommende-arrangementer&arrangement=${arrangementId}`;
    void navigator.clipboard.writeText(url).then(() => {
      toast.success("Lenke kopiert til utklippstavle");
    });
  }

  return (
    <PageSection
      title="Kommende arrangementer"
      description="Oversikt over arrangementer som er planlagt fremover."
    >
      {arrangementer.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Ingen arrangementer registrert.</p>
      ) : (
        <Accordion
          type="single"
          collapsible
          className="space-y-1"
          defaultValue={defaultArrangementId}
        >
          {arrangementer.map((arr) => {
            const dagerIgjen = dagerIgjenFra(arr.startDato);
            const beskrivelse = arr.beskrivelse?.trim() ?? "";
            const harBeskrivelse = beskrivelse.length > 0;
            const harBaner = (arr.baner?.length ?? 0) > 0;
            const harUkedager = (arr.ukedager?.length ?? 0) > 0;
            const harTidspunkter = (arr.tidspunkter?.length ?? 0) > 0;

            return (
              <AccordionItem
                key={arr.id}
                value={arr.id}
                className="rounded-md border bg-background px-4 last:border-b shadow-sm"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-col items-start gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{arr.tittel}</span>
                      <Badge variant="secondary" className="text-xs">
                        {dagerIgjen} {dagerIgjen === 1 ? "dag" : "dager"}
                      </Badge>
                      {arr.tillaterPaamelding && arr.erPaameldt && (
                        <span className="text-green-600" title="Du er påmeldt">
                          <UserCheck className="size-4" />
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{datoTekst(arr)}</span>
                  </div>
                </AccordionTrigger>

                <AccordionContent>
                  <div className="space-y-4">
                    {harBeskrivelse && (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {beskrivelse}
                      </p>
                    )}

                    <AccordionDetailGrid>
                      {harBaner && (
                        <AccordionDetailRow icon={MapPin} label="Baner">
                          {arr.baner?.join(", ")}
                        </AccordionDetailRow>
                      )}

                      {harUkedager && (
                        <AccordionDetailRow icon={Calendar} label="Ukedager">
                          {formatDayOfWeeksLangNorsk(arr.ukedager)}
                        </AccordionDetailRow>
                      )}

                      {harTidspunkter && (
                        <AccordionDetailRow icon={Clock} label="Tidspunkter" colSpan={2}>
                          {arr.tidspunkter?.join(", ")}
                          {arr.slotLengdeMinutter && (
                            <span className="text-muted-foreground">
                              {" "}
                              ({arr.slotLengdeMinutter} min)
                            </span>
                          )}
                        </AccordionDetailRow>
                      )}
                      {arr.tillaterPaamelding && (
                        <AccordionDetailRow
                          icon={Users}
                          label="Påmeldte"
                          iconClassName={arr.erPaameldt ? "text-green-600" : undefined}
                        >
                          <PaameldteDialog arrangementId={arr.id} tittel={arr.tittel}>
                            <button
                              type="button"
                              className="underline underline-offset-2 hover:text-foreground transition-colors"
                            >
                              {arr.antallPaameldte} påmeldt
                            </button>
                          </PaameldteDialog>
                        </AccordionDetailRow>
                      )}
                    </AccordionDetailGrid>

                    {arr.tillattHandlinger.length > 0 && (
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t">
                        {harHandling(arr.tillattHandlinger, "arrangement:kopierLenke") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => kopierLenke(arr.id)}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Link className="h-4 w-4" />
                            Kopier lenke
                          </Button>
                        )}
                        {harHandling(arr.tillattHandlinger, "arrangement:avlys") && (
                          <SlettArrangementDialog
                            tittel={arr.tittel}
                            onSlett={() => onAvlys(arr).then(() => {})}
                            trigger={
                              <Button
                                variant="destructive"
                                size="sm"
                                className="flex items-center gap-2 text-sm"
                              >
                                <Ban className="size-4" />
                                Avlys
                              </Button>
                            }
                          />
                        )}
                        {harHandling(arr.tillattHandlinger, "arrangement:meldAv") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onMeldAv(arr)}
                            className="flex items-center gap-2 text-sm"
                          >
                            <XCircle className="size-4" />
                            Meld meg av
                          </Button>
                        )}
                        {harHandling(arr.tillattHandlinger, "arrangement:meldPaa") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onMeldPaa(arr)}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CalendarPlus className="size-4" />
                            Meld meg på
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </PageSection>
  );
}
