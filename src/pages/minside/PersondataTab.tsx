import { Button } from "@/components/ui/button.js";
import { FieldWrapper } from "@/components/FieldWrapper.js";
import SlettMegDialog from "@/components/SlettMegDialog.js";
import { formatDatoKort } from "@/utils/datoUtils.js";
import PageSection from "@/components/PageSection.js";
import { useMeg } from "@/hooks/useMeg.js";
import LoaderSkeleton from "@/components/LoaderSkeleton.js";
import { Link } from "react-router-dom";

type Props = { slug: string };

export default function PersondataTab({ slug }: Props) {
  const { bruker, laster, lastNedEgenData, slettMeg } = useMeg(slug);

  if (laster || !bruker) {
    return <LoaderSkeleton />;
  }

  return (
    <PageSection bordered className="space-y-4">
      <FieldWrapper
        id="vilkaar"
        label="Vilkår for bruk"
        helpText="Du aksepterer vilkårene automatisk ved første innlogging."
      >
        {bruker.vilkaarAkseptertDato ? (
          <p className="text-sm text-foreground">
            Akseptert {formatDatoKort(bruker.vilkaarAkseptertDato)}{" "}
            {bruker.vilkaarVersjon &&
              `(versjon ${bruker.vilkaarVersjon})`}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Ikke registrert
          </p>
        )}
        <p className="text-sm mt-1">
         <Link
          to={`/${slug}/vilkaar`}
          className="underline text-primary hover:text-primary/80"
          target="_blank"
          rel="noopener noreferrer"
            >
          Les vilkårene
        </Link>
        </p>
      </FieldWrapper>

      <FieldWrapper
        id="last-ned-data"
        label="Last ned dine data"
        helpText="Du kan laste ned alle registrerte opplysninger og bookinger i JSON-format."
      >
        <Button onClick={lastNedEgenData} size="sm" variant="outline">
          Last ned data
        </Button>
      </FieldWrapper>

      <FieldWrapper
        id="slett-bruker"
        label="Slett bruker"
        helpText="Dette sletter brukeren din og all tilknyttet data permanent."
      >
        <SlettMegDialog slettMeg={slettMeg} />
      </FieldWrapper>
    </PageSection>
  );
}
