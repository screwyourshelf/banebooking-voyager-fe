import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed"> & {
  selected: boolean;
};

export default function ControlChoice({ selected, className, children, ...props }: Props) {
  return (
    <button
      type="button"
      className={cn("control-choice", className)}
      data-selected={selected}
      aria-pressed={selected}
      {...props}
    >
      {children}
    </button>
  );
}
