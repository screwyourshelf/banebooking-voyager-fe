import { BadgeCheck } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useBruker } from "@/hooks/useBruker";

/** @deprecated Ikke lenger brukt — medlemskapinfo vises i Konto-seksjonen. */
export default function MedlemskapStatusBanner() {
  const { bruker } = useBruker();

  if (!bruker) return null;

  const label = bruker.medlemskapBekreftelseLabel;
  const bekreftetDato = bruker.medlemskapBekreftetDato;
  const måBekreftes = bruker.måBekrefteMedlemskap;

  // Ingen aktiv bekreftelsesperiode — vis ingenting
  if (!label) return null;

  // Allerede bekreftet for denne perioden
  if (!måBekreftes && bekreftetDato) {
    const dato = new Date(bekreftetDato).toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <Alert>
        <BadgeCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
        <AlertTitle>Medlemskap bekreftet</AlertTitle>
        <AlertDescription>Du bekreftet {dato}.</AlertDescription>
      </Alert>
    );
  }

  return null;
}
