import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  colSpan?: 2;
  className?: string;
};

export default function AccordionDetailRow({
  icon: Icon,
  label,
  children,
  colSpan,
  className,
}: Props) {
  return (
    <div className={cn("flex items-start gap-2", colSpan === 2 && "sm:col-span-2", className)}>
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}
