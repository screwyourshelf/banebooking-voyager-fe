import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useKlubb } from "@/hooks/useKlubb";
import { useBruker } from "@/hooks/useBruker";
import { useBekreftMedlemskap } from "@/hooks/useBekreftMedlemskap";
import { useSlug } from "@/hooks/useSlug";
import { ErrorDisplay } from "@/components/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const MEDLEMSKAP_TYPER = [
  { value: "BarnJunior", label: "Barn/junior (inntil 19 år)" },
  { value: "StudentVernepliktig", label: "Student/vernepliktig" },
  { value: "Voksen", label: "Voksen" },
  { value: "Familie", label: "Familiemedlemskap" },
] as const;

export default function BekreftMedlemskapPage() {
  const slug = useSlug();
  const { data: klubb, isLoading: lasterKlubb } = useKlubb();
  const { bruker, laster: lasterBruker } = useBruker();
  const { bekreft, laster, vellykket, feil } = useBekreftMedlemskap();

  const [fulltNavn, setFulltNavn] = useState("");
  const [medlemskapType, setMedlemskapType] = useState("");

  if (lasterKlubb || lasterBruker) return null;

  // Etter vellykket bekreftelse og brukerdata er oppdatert — naviger til bookingsiden
  if (!bruker?.måBekrefteMedlemskap && vellykket) {
    return <Navigate to={`/${slug}`} replace />;
  }

  const label = bruker?.medlemskapBekreftelseLabel ?? klubb?.navn ?? "klubben";
  const kanBekrefte = fulltNavn.trim().length > 0 && medlemskapType.length > 0;

  return (
    <ErrorDisplay
      icon={BadgeCheck}
      title="Hei! Tid for en rask oppdatering"
      description="Klubben ber alle medlemmer bekrefte medlemskapet sitt for den nye sesongen. Det tar bare noen sekunder!"
    >
      <div className="space-y-4 w-full max-w-xs">
        <div className="space-y-2">
          <Label htmlFor="fulltNavn">Fullt navn</Label>
          <Input
            id="fulltNavn"
            placeholder="Ola Nordmann"
            value={fulltNavn}
            onChange={(e) => setFulltNavn(e.target.value)}
            disabled={laster || vellykket}
          />
        </div>

        <div className="space-y-2">
          <Label>Type medlemskap</Label>
          <RadioGroup
            value={medlemskapType}
            onValueChange={setMedlemskapType}
            disabled={laster || vellykket}
          >
            {MEDLEMSKAP_TYPER.map((type) => (
              <div key={type.value} className="flex items-center gap-2">
                <RadioGroupItem value={type.value} id={type.value} />
                <Label htmlFor={type.value} className="font-normal cursor-pointer">
                  {type.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Button
          onClick={() => void bekreft({ fulltNavn: fulltNavn.trim(), medlemskapType })}
          disabled={!kanBekrefte || laster || vellykket}
          className="w-full"
        >
          {laster ? "Bekrefter…" : vellykket ? "Bekreftet!" : "Jeg bekrefter mitt medlemskap"}
        </Button>

        {feil && (
          <p className="text-sm text-destructive text-center">Noe gikk galt. Prøv igjen senere.</p>
        )}
      </div>
    </ErrorDisplay>
  );
}
