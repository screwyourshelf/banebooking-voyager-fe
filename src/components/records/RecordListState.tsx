import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "default" | "danger";
  role?: "status" | "alert";
  className?: string;
};

export default function RecordListState({
  icon,
  title,
  description,
  action,
  tone = "default",
  role = "status",
  className,
}: Props) {
  return (
    <div className={cn("record-list-state", className)} data-tone={tone} role={role}>
      {icon ? <span className="record-list-state__icon">{icon}</span> : null}
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
      {action ? <div className="record-list-state__action">{action}</div> : null}
    </div>
  );
}
