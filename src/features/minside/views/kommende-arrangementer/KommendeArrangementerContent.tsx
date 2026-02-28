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
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { FaCalendarPlus, FaTimesCircle, FaBan } from "react-icons/fa";
import { SlettArrangementDialog } from "@/features/arrangement/components";
import type { KommendeArrangementRespons } from "@/types";

type Props = {
  arrangementer: KommendeArrangementRespons[];
  onMeldPaa: (arr: KommendeArrangementRespons) => void;
  onMeldAv: (arr: KommendeArrangementRespons) => void;
  onAvlys: (arr: KommendeArrangementRespons) => Promise<unknown>;
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
}: Props) {
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
                        <AccordionDetailRow icon={Users} label="Påmeldte">
                          {arr.antallPaameldte} påmeldt
                        </AccordionDetailRow>
                      )}
                    </AccordionDetailGrid>

                    {(arr.tillaterPaamelding || arr.kanAvlyse) && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t">
                        {arr.kanAvlyse && (
                          <SlettArrangementDialog
                            tittel={arr.tittel}
                            onSlett={() => onAvlys(arr).then(() => {})}
                            trigger={
                              <Button
                                variant="destructive"
                                size="sm"
                                className="flex items-center gap-2 text-sm"
                              >
                                <FaBan />
                                Avlys
                              </Button>
                            }
                          />
                        )}
                        {arr.tillaterPaamelding &&
                          (arr.erPaameldt ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onMeldAv(arr)}
                              className="flex items-center gap-2 text-sm"
                            >
                              <FaTimesCircle />
                              Meld meg av
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onMeldPaa(arr)}
                              className="flex items-center gap-2 text-sm"
                            >
                              <FaCalendarPlus />
                              Meld meg på
                            </Button>
                          ))}
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
