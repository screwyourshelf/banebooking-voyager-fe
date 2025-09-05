import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button.js";
import LoaderSkeleton from "@/components/LoaderSkeleton.js";
import { FormField } from "@/components/FormField.js";
import { FieldWrapper } from "@/components/FieldWrapper.js";
import { useMeg } from "@/hooks/useMeg.js";
import PageSection from "@/components/PageSection.js";

const MAX_LENGTH = 50;
const NAVN_REGEX = /^[\p{L}\d\s.@'_%+-]{2,}$/u;

type Props = {
  slug: string;
};

export default function MinProfilTab({ slug }: Props) {
  const { bruker, laster: lasterMeg, oppdaterVisningsnavn } = useMeg(slug);

  const [visningsnavn, setVisningsnavn] = useState("");
  const [brukEpostSomVisningsnavn, setBrukEpostSomVisningsnavn] =
    useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  useEffect(() => {
    if (bruker) {
      const navn = bruker.visningsnavn?.trim();
      if (!navn || navn === bruker.epost) {
        setBrukEpostSomVisningsnavn(true);
        setVisningsnavn("");
      } else {
        setVisningsnavn(navn);
        setBrukEpostSomVisningsnavn(false);
      }
    }
  }, [bruker]);

  const validerOgLagre = async () => {
    if (!bruker) return;

    if (brukEpostSomVisningsnavn) {
      setFeil(null);
      await oppdaterVisningsnavn.mutateAsync(bruker.epost);
      return;
    }

    const navn = visningsnavn.trim();

    if (navn.length === 0) {
      setFeil("Visningsnavn kan ikke være tomt.");
      return;
    }

    if (navn.length < 3) {
      setFeil("Visningsnavn må være minst 3 tegn.");
      return;
    }

    if (!NAVN_REGEX.test(navn)) {
      setFeil("Visningsnavn inneholder ugyldige tegn.");
      return;
    }

    if (navn.length > MAX_LENGTH) {
      setFeil(`Visningsnavn kan ikke være lengre enn ${MAX_LENGTH} tegn.`);
      return;
    }

    setFeil(null);
    await oppdaterVisningsnavn.mutateAsync(navn);
  };

  const kanLagre = bruker
    ? brukEpostSomVisningsnavn
      ? bruker.visningsnavn !== bruker.epost
      : visningsnavn.trim() !== bruker.visningsnavn
    : false;

  if (lasterMeg || !bruker) {
    return <LoaderSkeleton />;
  }

  return (
    <>
      {/* Skjema for visningsnavn */}
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void validerOgLagre();
        }}
      >
        <FormField
          id="visningsnavn"
          label="Visningsnavn"
          value={brukEpostSomVisningsnavn ? "" : visningsnavn}
          maxLength={MAX_LENGTH}
          placeholder={bruker?.epost || "f.eks. Ola Nordmann"}
          onChange={(e) => {
            setVisningsnavn(e.target.value);
            setBrukEpostSomVisningsnavn(false);
          }}
          disabled={brukEpostSomVisningsnavn}
          error={feil}
          helpText="Navnet vises i grensesnittet, og settes automatisk til e-post ved første innlogging."
        />

        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={brukEpostSomVisningsnavn}
            onChange={(e) => {
              setBrukEpostSomVisningsnavn(e.target.checked);
              if (e.target.checked) setVisningsnavn("");
            }}
          />
          <span>Bruk e-post som visningsnavn</span>
        </label>

        <Button
          type="submit"
          size="sm"
          disabled={!kanLagre || oppdaterVisningsnavn.isPending}
        >
          {oppdaterVisningsnavn.isPending ? "Lagrer..." : "Lagre"}
        </Button>
      </form>

      {/* Brukerinfo */}
      <PageSection bordered className="space-y-4">
        <FieldWrapper id="epost" label="Brukernavn / ID">
          <p className="text-sm text-foreground">{bruker.epost}</p>
        </FieldWrapper>

        <FieldWrapper
          id="rolle"
          label="Rolle (i klubben)"
          helpText="Roller tildeles av klubbens administrator og kan ikke endres manuelt."
        >
          <p className="text-sm text-foreground">
            {bruker.roller.join(", ")}
          </p>
        </FieldWrapper>
      </PageSection>
    </>
  );
}
