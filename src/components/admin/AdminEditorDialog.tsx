import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  trigger?: ReactNode;
  closeDisabled?: boolean;
  size?: "default" | "wide";
};

export default function AdminEditorDialog({
  open,
  onOpenChange,
  backLabel,
  eyebrow,
  title,
  description,
  children,
  trigger,
  closeDisabled = false,
  size = "default",
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="admin-editor-dialog" data-size={size} showCloseButton={false}>
        <DialogHeader className="admin-editor-dialog__header">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="admin-editor-dialog__back"
              disabled={closeDisabled}
            >
              <ArrowLeft data-icon="inline-start" aria-hidden="true" />
              {backLabel}
            </Button>
          </DialogClose>

          <div className="admin-editor-dialog__heading">
            <span className="admin-editor-dialog__eyebrow">{eyebrow}</span>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </div>
        </DialogHeader>

        <div className="admin-editor-dialog__body">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
