import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";

import ForhandsvisningTable from "./ForhandsvisningTable";
import type { ArrangementForhåndsvisningRespons } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  beskrivelse: string;

  forhandsvisning: ArrangementForhåndsvisningRespons;
  isLoading: boolean;

  onCreate: () => void;
  bekreftTekst?: string;
  advarsel?: string;
};

export default function ForhandsvisningDialog({
  open,
  onOpenChange,
  beskrivelse,
  forhandsvisning,
  isLoading,
  onCreate,
  bekreftTekst,
  advarsel,
}: Props) {
  const antallLedige = forhandsvisning.ledige.length;
  const antallKonflikter = forhandsvisning.konflikter.length;
  const harSlots = antallLedige + antallKonflikter > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Forhåndsvis bookingene</DialogTitle>
          <DialogDescription className="sr-only">
            Forhåndsvisning av bookinger som vil bli opprettet
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-muted-foreground italic">Laster forhåndsvisning…</p>
        ) : !harSlots ? (
          <p className="text-muted-foreground italic">Ingen bookinger å vise.</p>
        ) : (
          <>
            {advarsel && (
              <Alert className="border-amber-200 bg-amber-50 text-amber-700 [&>svg]:text-amber-700">
                <TriangleAlert />
                <AlertDescription>{advarsel}</AlertDescription>
              </Alert>
            )}

            <ForhandsvisningTable beskrivelse={beskrivelse} forhandsvisning={forhandsvisning} />

            <DialogFooter className="mt-3">
              <Button type="button" aria-label="Opprett bookinger" onClick={onCreate}>
                {bekreftTekst ?? `Opprett ${antallLedige} bookinger`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
