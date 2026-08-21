import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  divided?: boolean;
  density?: "default" | "compact";
};

export default function RowList({
  children,
  className,
  divided = true,
  density = "compact",
}: Props) {
  return (
    <div
      className={className}
      data-ui="row-list"
      data-divided={divided || undefined}
      data-density={density}
    >
      {children}
    </div>
  );
}
