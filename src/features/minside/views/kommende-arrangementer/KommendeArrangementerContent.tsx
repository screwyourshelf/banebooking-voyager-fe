import PageSection from "@/components/sections/PageSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { formatDatoKort, formatDayOfWeeksLangNorsk } from "@/utils/datoUtils";
import { Calendar, Clock, MapPin } from "lucide-react";
import type { KommendeArrangementRespons } from "@/types";

type Props = {
  arrangementer: KommendeArrangementRespons[];
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

export default function KommendeArrangementerContent({ arrangementer }: Props) {
  return (
    <PageSection
      title="Kommende arrangementer"
      description="Oversikt over arrangementer som er planlagt fremover."
    >
      {arrangementer.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Ingen arrangementer registrert.</p>
      ) : (
        <Accordion type="single" collapsible className="rounded-md border bg-background">
          {arrangementer.map((arr) => {
            const dagerIgjen = dagerIgjenFra(arr.startDato);
            const beskrivelse = arr.beskrivelse?.trim() ?? "";
            const harBeskrivelse = beskrivelse.length > 0;
            const harBaner = (arr.baner?.length ?? 0) > 0;
            const harUkedager = (arr.ukedager?.length ?? 0) > 0;
            const harTidspunkter = (arr.tidspunkter?.length ?? 0) > 0;

            return (
              <AccordionItem key={arr.id} value={arr.id} className="px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-col items-start gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{arr.tittel}</span>
                      <Badge variant="secondary" className="text-xs">
                        {dagerIgjen} {dagerIgjen === 1 ? "dag" : "dager"}
                      </Badge>
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

                    <div className="grid gap-3 sm:grid-cols-2">
                      {harBaner && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <div className="text-xs font-medium text-muted-foreground">Baner</div>
                            <div className="text-sm">{arr.baner?.join(", ")}</div>
                          </div>
                        </div>
                      )}

                      {harUkedager && (
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <div className="text-xs font-medium text-muted-foreground">
                              Ukedager
                            </div>
                            <div className="text-sm">{formatDayOfWeeksLangNorsk(arr.ukedager)}</div>
                          </div>
                        </div>
                      )}

                      {harTidspunkter && (
                        <div className="flex items-start gap-2 sm:col-span-2">
                          <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <div className="text-xs font-medium text-muted-foreground">
                              Tidspunkter
                            </div>
                            <div className="text-sm">
                              {arr.tidspunkter?.join(", ")}
                              {arr.slotLengdeMinutter && (
                                <span className="text-muted-foreground">
                                  {" "}
                                  ({arr.slotLengdeMinutter} min)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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
