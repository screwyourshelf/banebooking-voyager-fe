import { Dialog } from "@/components";

import NyGrenView from "./NyGrenView";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function NyGrenDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog.Editor
      open={open}
      onOpenChange={onOpenChange}
      backLabel="Alle grener"
      eyebrow="Ny gren"
      title="Opprett gren"
      description="Angi navn og standardregler for banene i grenen."
    >
      <NyGrenView onCreated={() => onOpenChange(false)} />
    </Dialog.Editor>
  );
}
