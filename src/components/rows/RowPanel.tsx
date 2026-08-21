import type { ComponentProps, ReactNode } from "react";

type Props = ComponentProps<"div"> & {
  children: ReactNode;
  className?: string;
  intent?: "default" | "danger";
};

export default function RowPanel({ children, className, intent = "default", ...props }: Props) {
  return (
    <div className={className} data-surface="row-panel" data-intent={intent} {...props}>
      {children}
    </div>
  );
}
