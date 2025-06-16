import { useParams } from 'react-router-dom';
import { useKlubb } from '../hooks/useKlubb.js';
import LoaderSkeleton from '../components/LoaderSkeleton.js';
import { Card, CardContent } from '@/components/ui/card.js';


export default function ReglementPage() {
    const { slug } = useParams();
    const { klubb, laster } = useKlubb(slug);

    if (laster) {
        return (
            <div className="max-w-screen-sm mx-auto px-2 py-4 space-y-6">
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
        <Card>
            <CardContent className="p-4 space-y-6">
                <section>
                    <h2 className="text-sm font-semibold mb-2">Bookingregler</h2>
                    <ul className="list-disc list-inside text-sm text-gray-800">
                        <li>Maks {bookingRegel.maksPerDag} bookinger per dag</li>
                        <li>Maks {bookingRegel.maksTotalt} aktive bookinger totalt</li>
                        <li>Du kan booke opptil {bookingRegel.dagerFremITid} dager frem i tid</li>
                        <li>Hver booking varer i {bookingRegel.slotLengdeMinutter} minutter</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-sm font-semibold mb-2">Banereglement</h2>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                        {banereglement || 'Ingen spesifikt reglement oppgitt av klubben.'}
                    </p>
                </section>
            </CardContent>
        </Card>

    );
}
