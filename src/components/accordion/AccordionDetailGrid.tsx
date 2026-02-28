import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function AccordionDetailGrid({ children, className }: Props) {
  return <div className={cn("grid gap-3 sm:grid-cols-2", className)}>{children}</div>;
}
