import { useParams } from 'react-router-dom';
import { useKlubb } from '../hooks/useKlubb.js';
import LoaderSkeleton from '../components/LoaderSkeleton.js';
import { Card, CardContent } from '@/components/ui/card.js';
import { FieldWrapper } from '@/components/FieldWrapper.js';

export default function ReglementPage() {
    const { slug } = useParams();
    const { klubb, laster } = useKlubb(slug);

    if (laster) {
        return (
            <div className="max-w-screen-sm mx-auto px-2 py-4">
                <LoaderSkeleton />
            </div>
        );
    }

    if (!klubb) {
        return (
            <p className="text-sm text-destructive px-2 py-2 text-center">
                Reglement ikke tilgjengelig.
            </p>
        );
    }

    const { bookingRegel, banereglement } = klubb;

    return (
        <div className="max-w-screen-sm mx-auto px-2 py-4">
            <Card>
                <CardContent className="p-4 space-y-6">
                    <FieldWrapper
                        id="bookingregler"
                        label="Bookingregler"
                        helpText="Regler for når og hvor mye man kan booke"
                    >
                        <ul className="list-disc list-inside text-sm text-foreground">
                            <li>Maks {bookingRegel.maksPerDag} bookinger per dag</li>
                            <li>Maks {bookingRegel.maksTotalt} aktive bookinger totalt</li>
                            <li>Du kan booke opptil {bookingRegel.dagerFremITid} dager frem i tid</li>
                            <li>Hver booking varer i {bookingRegel.slotLengdeMinutter} minutter</li>
                        </ul>
                    </FieldWrapper>

                    <FieldWrapper
                        id="banereglement"
                        label="Banereglement"
                        helpText="Generelle regler for bruk av banene"
                    >
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                            {banereglement || 'Ingen spesifikt reglement oppgitt av klubben.'}
                        </p>
                    </FieldWrapper>
                </CardContent>
            </Card>
        </div>
    );
}
