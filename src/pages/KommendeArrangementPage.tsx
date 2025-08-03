import { useContext } from 'react';
import { SlugContext } from '../contexts/SlugContext.js';
import { useParams } from 'react-router-dom';
import { useArrangement } from '../hooks/useArrangement.js';

import LoaderSkeleton from '@/components/LoaderSkeleton.js';
import { Card, CardContent } from '@/components/ui/card.js';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table.js';
import { formatDatoKort } from '../utils/datoUtils.js';
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from '@/components/ui/alert-dialog.js';
import { Button } from '@/components/ui/button.js';

export default function KommendeArrangementPage() {
    const { slug: slugFraParams } = useParams<{ slug: string }>();
    const slug = useContext(SlugContext) ?? slugFraParams;

    const { arrangementer, isLoading, slettArrangement, sletterArrangementId } = useArrangement(slug);

    const visHandling = arrangementer.some((arr) => arr.kanSlettes);

    return (
        <div className="max-w-screen-md mx-auto px-2 py-4">
            <h1 className="text-xl font-semibold mb-4">Kommende arrangementer</h1>
            <Card>
                <CardContent className="p-4 space-y-4">
                    {isLoading ? (
                        <LoaderSkeleton />
                    ) : arrangementer.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                            Ingen arrangementer registrert.
                        </p>
                    ) : (
                        <div className="overflow-auto max-h-[60vh] border-b border-x rounded-b-md">
                            <Table className="text-sm">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-1/3">Hva</TableHead>
                                        <TableHead className="w-1/3">Når</TableHead>
                                        <TableHead>Om</TableHead>
                                        {visHandling && (
                                            <TableHead className="text-right">Handling</TableHead>
                                        )}
                                    </TableRow>

                                </TableHeader>
                                <TableBody>
                                    {arrangementer.map((arr) => {
                                        const start = new Date(arr.startDato);
                                        const iDag = new Date();
                                        const dagerIgjen = Math.max(
                                            0,
                                            Math.ceil(
                                                (start.getTime() - iDag.getTime()) / (1000 * 60 * 60 * 24)
                                            )
                                        );

                                        return (
                                            <TableRow key={arr.id}>
                                                <TableCell className="whitespace-normal break-words">
                                                    <div className="font-medium">{arr.tittel}</div>
                                                    {arr.beskrivelse && (
                                                        <div className="text-muted-foreground text-xs">
                                                            {arr.beskrivelse}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {arr.startDato === arr.sluttDato
                                                        ? formatDatoKort(arr.startDato)
                                                        : `${formatDatoKort(arr.startDato)} - ${formatDatoKort(arr.sluttDato)}`}
                                                </TableCell>
                                                <TableCell>
                                                    {dagerIgjen} {dagerIgjen === 1 ? 'dag' : 'dager'}
                                                </TableCell>
                                                {visHandling && (
                                                    <TableCell className="text-right">
                                                        {arr.kanSlettes && (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="destructive" size="sm">
                                                                        Avlys
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Avlys arrangement</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Er du sikker på at du vil avlyse «{arr.tittel}»?
                                                                            Alle tilknyttede bookinger vil slettes.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            disabled={sletterArrangementId === arr.id}
                                                                            onClick={() => slettArrangement(arr.id)}
                                                                        >
                                                                            {sletterArrangementId === arr.id ? 'Avlyser...' : 'Ja, avlys'}
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        )}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
