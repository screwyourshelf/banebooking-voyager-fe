import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function AccordionActions({ children, className }: Props) {
  return <div className={cn("flex justify-end pt-2 border-t", className)}>{children}</div>;
}
