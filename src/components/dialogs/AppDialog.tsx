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
}: Props) {
  const content = (
    <>
      <DialogHeader data-part="header">
        <DialogTitle>{title}</DialogTitle>
        {description ? <DialogDescription>{description}</DialogDescription> : null}
      </DialogHeader>
      <div data-part="content">{children}</div>
      {actions ? <DialogFooter data-part="actions">{actions}</DialogFooter> : null}
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent data-ui="dialog">
        {onSubmit ? (
          <form data-part="form" onSubmit={onSubmit}>
            {content}
          </form>
        ) : (
          content
        )}
      </DialogContent>
    </Dialog>
  );
}
