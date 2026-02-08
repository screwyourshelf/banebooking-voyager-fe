import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useKlubb } from "@/hooks/useKlubb";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function ReglementDialog({ children }: Props) {
  const { data: klubb, isLoading } = useKlubb();

  if (isLoading || !klubb) {
    return null;
  }

  const { bookingRegel } = klubb;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bookingregler</DialogTitle>
          <DialogDescription className="sr-only">
            Oversikt over bookingreglene i klubben
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
