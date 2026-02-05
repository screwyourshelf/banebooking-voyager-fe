import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import ForhandsvisningTable from "./ForhandsvisningTable";

type Bane = { id: string; navn: string };
type Slot = { dato: string; startTid: string; sluttTid: string; baneId: string };

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;

    baner: Bane[];
    beskrivelse: string;

    forhandsvisning: { ledige: Slot[]; konflikter: Slot[] };
    isLoading: boolean;

    onCreate: () => void;
};

export default function ForhandsvisningDialog({
    open,
    onOpenChange,
    baner,
    beskrivelse,
    forhandsvisning,
    isLoading,
    onCreate,
}: Props) {
    const harSlots = forhandsvisning.ledige.length + forhandsvisning.konflikter.length > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Forhåndsvis bookingene</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <p className="text-muted-foreground italic">Laster forhåndsvisning…</p>
                ) : harSlots ? (
                    <>
                        <ForhandsvisningTable
                            baner={baner}
                            beskrivelse={beskrivelse}
                            forhandsvisning={forhandsvisning}
                        />

                        <DialogFooter className="mt-3">
                            <Button type="button" onClick={onCreate} disabled={isLoading}>
                                Opprett {forhandsvisning.ledige.length} bookinger
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <p className="text-muted-foreground italic">Ingen bookinger å vise.</p>
                )}
            </DialogContent>
        </Dialog>
    );
}
