import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import ForhandsvisningTable from "./ForhandsvisningTable";
import type { ArrangementForhåndsvisningRespons } from "../../types";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;

    beskrivelse: string;

    forhandsvisning: ArrangementForhåndsvisningRespons;
    isLoading: boolean;

    onCreate: () => void;
};

export default function ForhandsvisningDialog({
    open,
    onOpenChange,
    beskrivelse,
    forhandsvisning,
    isLoading,
    onCreate,
}: Props) {
    const antallLedige = forhandsvisning.ledige.length;
    const antallKonflikter = forhandsvisning.konflikter.length;
    const harSlots = antallLedige + antallKonflikter > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Forhåndsvis bookingene</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <p className="text-muted-foreground italic">Laster forhåndsvisning…</p>
                ) : !harSlots ? (
                    <p className="text-muted-foreground italic">Ingen bookinger å vise.</p>
                ) : (
                    <>
                        <ForhandsvisningTable
                            beskrivelse={beskrivelse}
                            forhandsvisning={forhandsvisning}
                        />

                        <DialogFooter className="mt-3">
                            <Button type="button" onClick={onCreate}>
                                Opprett {antallLedige} bookinger
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
