import { useKlubb } from "@/hooks/useKlubb";
import LoaderSkeleton from "@/components/LoaderSkeleton";
import Page from "@/components/Page";
import { AKTIV_VILKAAR } from "./vilkaar";

export default function VilkaarPage() {
  const { data: klubb, isLoading } = useKlubb();

  if (isLoading || !klubb) {
    return (
      <Page>
        <div className="p-4">
          <LoaderSkeleton />
        </div> 
      </Page>
    );
  }

  return (
    <Page>
          <header className="space-y-1 mb-4">
              <h1 className="text-xl font-semibold">Vilkår for bruk</h1>
              <p className="text-xs text-muted-foreground">
                  Oppdatert: {AKTIV_VILKAAR.visningsDato}
              </p>
          </header>

          <p className="text-sm text-muted-foreground mb-6 max-w-prose">
              Disse vilkårene gjelder for bruk av banebooking i{" "}
              <strong>{klubb.navn}</strong>. Ved å logge inn samtykker du til disse
              vilkårene.
          </p>


          <section className="space-y-6 text-sm leading-relaxed">
              <div>
                  <h2 className="font-semibold">1. Bruk av tjenesten</h2>
                  <p>
                      Banebooking er et verktøy for reservasjon av baner i{" "}
                      <strong>{klubb.navn}</strong>. For å kunne booke baner må du være medlem,
                      eller ha fått tilgang av klubbens administrator.
                  </p>
              </div>

              <div>
                  <h2 className="font-semibold">2. Brukerkonto og innlogging</h2>
                  <p>
                      Innlogging i tjenesten skjer via e-post eller tredjepartsleverandører for
                      autentisering (for eksempel Google eller Facebook). For å holde brukeren
                      innlogget mellom økter benyttes lokal lagring (localStorage) i nettleseren.
                      Tjenesten benytter ikke informasjonskapsler (cookies) til sporing eller analyse.
                  </p>
              </div>

              <div>
                  <h2 className="font-semibold">3. Personopplysninger</h2>
                  <p>
                      Vi lagrer nødvendige personopplysninger som navn, e-postadresse og dine
                      bookingaktiviteter for å kunne levere tjenesten. Du kan når som helst
                      se, laste ned eller slette dine data via <em>Min side</em>.
                  </p>
              </div>

              <div>
                  <h2 className="font-semibold">4. Bruk, ansvar og misbruk</h2>
                  <p>
                      Ved misbruk av bookingløsningen eller brudd på klubbens retningslinjer, kan
                      tilgangen bli begrenset eller fjernet av klubbens administrator.
                  </p>
                  <p className="mt-2">
                      {klubb.navn} tar ikke ansvar for tap, kostnader eller ulemper som følge
                      av tekniske feil, dobbeltbookinger eller midlertidig utilgjengelighet
                      i systemet.
                  </p>
              </div>

              <div>
                  <h2 className="font-semibold">5. Endringer i tjenesten</h2>
                  <p>
                      Funksjonalitet og vilkår kan endres over tid. Ved vesentlige endringer
                      vil du bli bedt om å godta oppdaterte vilkår ved neste innlogging.
                  </p>
              </div>

              <div>
                  <h2 className="font-semibold">6. Kontakt</h2>
                  <p>
                      Spørsmål om tjenesten, personvern eller vilkår kan rettes til klubbens
                      kontaktperson eller via e-post til{" "}
                      {klubb.kontaktEpost ? (
                          <a
                              href={`mailto:${klubb.kontaktEpost}`}
                              className="underline text-primary hover:text-primary/80"
                          >
                              {klubb.kontaktEpost}
                          </a>
                      ) : (
                          <span className="italic text-muted-foreground">
                              (ingen kontaktadresse registrert)
                          </span>
                      )}
                      .
                  </p>
              </div>
          </section>

    </Page>
  );
}
