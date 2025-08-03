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

interface SlettArrangementDialogProps {
    tittel: string;
    onSlett: () => Promise<void>;
    trigger: React.ReactNode; // F.eks. ikonknapp
}

export default function SlettArrangementDialog({
    tittel,
    onSlett,
    trigger,
}: SlettArrangementDialogProps) {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onSlett();
            setOpen(false);
        } catch {
            // Du kan evt. legge til toast.error her
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {trigger}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Avlys arrangement</AlertDialogTitle>
                    <AlertDialogDescription>
                        Er du sikker på at du vil avlyse «{tittel}»? Alle tilknyttede bookinger vil slettes.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Avbryt</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        disabled={isDeleting}
                        onClick={handleDelete}
                    >
                        {isDeleting ? 'Avlyser...' : 'Ja, avlys'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
