import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Users } from "lucide-react";
import { usePaameldteListe } from "./usePaameldteListe";

type Props = {
  arrangementId: string;
  tittel: string;
  children: React.ReactNode;
};

export default function PaameldteDialog({ arrangementId, tittel, children }: Props) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = usePaameldteListe(arrangementId, open);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Påmeldte – {tittel}</DialogTitle>
          <DialogDescription>
            {data ? `${data.antallPaameldte} påmeldt` : "Henter påmeldte…"}
          </DialogDescription>
        </DialogHeader>

        {isLoading && <p className="text-muted-foreground italic">Henter påmeldte…</p>}

        {data && data.paameldte.length === 0 && (
          <p className="text-muted-foreground italic">Ingen påmeldte ennå.</p>
        )}

        {data && data.paameldte.length > 0 && (
          <ul className="space-y-2">
            {data.paameldte.map((bruker) => (
              <li key={bruker.brukerId} className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{bruker.visningsnavn}</span>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
