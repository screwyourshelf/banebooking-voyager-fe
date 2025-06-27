import { useState } from 'react';
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
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth.js';

interface SlettMegKnappProps {
    slettMeg: () => Promise<void>;
}

export default function SlettMegKnapp({ slettMeg }: SlettMegKnappProps) {
    const { signOut } = useAuth();  // Hent signOut funksjonen
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await slettMeg();
            toast.success('Brukeren er slettet');
            setOpen(false);

            await signOut();  // Logg ut brukeren etter sletting
        } catch {
            toast.error('Noe gikk galt ved sletting');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">Slett min bruker</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Dette vil slette din bruker og all tilknytning permanent. Denne handlingen kan ikke angres.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Avbryt</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Sletter...' : 'Slett bruker'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
