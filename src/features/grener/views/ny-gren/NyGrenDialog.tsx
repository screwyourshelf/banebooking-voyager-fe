import { AdminEditorDialog } from "@/components/admin";
import NyGrenView from "./NyGrenView";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function NyGrenDialog({ open, onOpenChange }: Props) {
  return (
    <AdminEditorDialog
      open={open}
      onOpenChange={onOpenChange}
      backLabel="Alle grener"
      eyebrow="Ny gren"
      title="Opprett gren"
      description="Angi navn og standardregler for banene i grenen."
    >
      <NyGrenView onCreated={() => onOpenChange(false)} />
    </AdminEditorDialog>
  );
}
