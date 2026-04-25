import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useGrener } from "@/hooks/useGrener";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  grenId?: string;
};

export default function ReglementDialog({ children, grenId }: Props) {
  const { grener, isLoading } = useGrener(false);

  if (isLoading || grener.length === 0) {
    return null;
  }

  const gren = grenId ? grener.find((g) => g.id === grenId) : grener[0];
  if (!gren) return null;

  const bookingRegel = gren.bookingInnstillinger;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bookingregler – {gren.navn}</DialogTitle>
          <DialogDescription className="sr-only">
            Oversikt over bookingreglene for {gren.navn}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <ul className="list-disc list-inside text-sm">
            <li>Maks {bookingRegel.maksPerDag} bookinger per dag</li>
            <li>Maks {bookingRegel.maksTotalt} aktive bookinger totalt</li>
            <li>Opptil {bookingRegel.dagerFremITid} dager frem i tid</li>
            <li>{bookingRegel.slotLengdeMinutter} minutter per booking</li>
            <li>
              Tillatt mellom {bookingRegel.aapningstid}–{bookingRegel.stengetid}
            </li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
