import { useParams } from 'react-router-dom';
import { useKlubb } from '@/hooks/useKlubb.js';
import LoaderSkeleton from '@/components/LoaderSkeleton.js';

export default function VilkaarPage() {
    const { slug } = useParams();
    const { klubb, laster } = useKlubb(slug);

    if (laster || !klubb) {
        return <div className="p-4"><LoaderSkeleton /></div>;
    }

    return (
        <div className="max-w-screen-sm mx-auto px-2 py-4">
            <h1 className="text-xl font-semibold mb-1">Vilkår for bruk</h1>
            <p className="text-xs text-muted-foreground mb-4">Oppdatert: 27. juni 2025</p>

            <p className="text-sm text-muted-foreground mb-4">
                Disse vilkårene gjelder for bruk av banebooking i <strong>{klubb.navn}</strong>.
                Ved å logge inn samtykker du til disse vilkårene.
            </p>

            <section className="space-y-3 text-sm">
                <div>
                    <h2 className="font-semibold mb-1">1. Bruk av tjenesten</h2>
                    <p>
                        Du må være medlem av {klubb.navn}, eller ha fått tilgang av en administrator, for å kunne booke baner.
                    </p>
                </div>

                <div>
                    <h2 className="font-semibold mb-1">2. Personopplysninger</h2>
                    <p>
                        Vi lagrer navn, e-post og dine bookingaktiviteter. Du kan når som helst slette kontoen din eller be om innsikt i dine data via "Min side".
                    </p>
                </div>

                <div>
                    <h2 className="font-semibold mb-1">3. Ansvar og misbruk</h2>
                    <p>
                        Ved misbruk (som dobbelbooking, feil bruk eller deling av innlogging) kan tilgangen din bli stengt av administrator i {klubb.navn}.
                    </p>
                </div>

                <div>
                    <h2 className="font-semibold mb-1">4. Endringer</h2>
                    <p>
                        Vilkårene kan endres, og du vil få beskjed dersom det skjer. Nye vilkår vil gjelde fra neste innlogging.
                    </p>
                </div>

                <div>
                    <h2 className="font-semibold mb-1">5. Kontakt</h2>
                    <p>
                        Spørsmål om personvern og vilkår kan rettes til klubbens kontaktperson eller via e-post til{' '}
                        <a href={`mailto:${klubb.kontaktEpost}`} className="underline">
                            {klubb.kontaktEpost}
                        </a>.
                    </p>
                </div>

                <div>
                    <h2 className="font-semibold mb-1">6. Informasjonskapsler (cookies)</h2>
                    <p>
                        Tjenesten benytter informasjonskapsler (cookies) for å sikre grunnleggende funksjonalitet,
                        som innlogging og vedlikehold av aktiv brukerøkt. Ingen sporing eller tredjepartsanalyse benyttes.
                        Ved å ta i bruk tjenesten samtykker du til bruk av slike nødvendige informasjonskapsler.
                    </p>
                </div>
            </section>
        </div>
    );
}
