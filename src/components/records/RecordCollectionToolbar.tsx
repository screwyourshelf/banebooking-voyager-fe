import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  icon: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export default function RecordCollectionToolbar({
  icon,
  title,
  description,
  actions,
  className,
}: Props) {
  return (
    <header className={cn("control-surface record-collection__toolbar", className)}>
      <div className="record-collection__summary">
        <span className="record-collection__summary-icon" aria-hidden="true">
          {icon}
        </span>
        <span className="record-collection__summary-copy">
          <strong>{title}</strong>
          {description ? <small>{description}</small> : null}
        </span>
      </div>

      {actions ? <div className="record-collection__toolbar-actions">{actions}</div> : null}
    </header>
  );
}
