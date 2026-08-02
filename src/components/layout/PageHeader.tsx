import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export default function PageHeader({ eyebrow, title, description, actions, className }: Props) {
  return (
    <header className={cn("page-heading", className)}>
      <div>
        {eyebrow ? <div className="page-heading__eyebrow">{eyebrow}</div> : null}
        <h1 className="page-heading__title">{title}</h1>
      </div>

      {description || actions ? (
        <div className="page-heading__support">
          {description ? <p className="page-heading__description">{description}</p> : null}
          {actions ? <div className="page-heading__actions">{actions}</div> : null}
        </div>
      ) : null}
    </header>
  );
}
