import { Dialog } from "@/components";

import NyBaneView from "./NyBaneView";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function NyBaneDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog.Editor
      open={open}
      onOpenChange={onOpenChange}
      backLabel="Alle baner"
      eyebrow="Ny bane"
      title="Opprett bane"
      description="Legg til en ny bane i klubbens bookingtilbud."
    >
      <NyBaneView onCreated={() => onOpenChange(false)} />
    </Dialog.Editor>
  );
}
