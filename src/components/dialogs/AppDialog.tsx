import type { FormEventHandler, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  size?: "compact" | "default" | "wide";
};

export default function AppDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  actions,
  onSubmit,
  size = "default",
}: Props) {
  const content = (
    <>
      <DialogHeader className="app-dialog__header">
        <DialogTitle>{title}</DialogTitle>
        {description ? <DialogDescription>{description}</DialogDescription> : null}
      </DialogHeader>
      <div className="app-dialog__body">{children}</div>
      {actions ? <DialogFooter className="app-dialog__footer">{actions}</DialogFooter> : null}
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="app-dialog" data-size={size}>
        {onSubmit ? (
          <form className="app-dialog__form" onSubmit={onSubmit}>
            {content}
          </form>
        ) : (
          content
        )}
      </DialogContent>
    </Dialog>
  );
}
