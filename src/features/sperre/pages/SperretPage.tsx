import { ShieldX, Mail } from "lucide-react";
import { useKlubb } from "@/hooks/useKlubb";
import { ErrorDisplay } from "@/components/errors";

export default function SperretPage() {
  const { data: klubb, isLoading } = useKlubb();

  if (isLoading) {
    return null;
  }

  return (
    <ErrorDisplay
      icon={ShieldX}
      title="Kontoen din er låst"
      description={`Du er låst ute fra ${klubb?.navn ?? "klubben"} og kan ikke booke baner eller melde deg på arrangementer.`}
    >
      <div className="rounded-md border p-4 space-y-2 text-sm w-full max-w-xs text-left">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Hva gjør jeg nå?</div>
          <p className="text-sm">
            Ta kontakt med {klubb?.navn ?? "klubben"} for å få mer informasjon og løse situasjonen.
          </p>
        </div>

        {klubb?.kontaktEpost && (
          <a
            href={`mailto:${klubb.kontaktEpost}`}
            className="flex items-center gap-2 text-sm font-medium hover:underline pt-1"
          >
            <Mail className="h-4 w-4 shrink-0" />
            {klubb.kontaktEpost}
          </a>
        )}
      </div>
    </ErrorDisplay>
  );
}
