import type { ReactNode } from "react";

export default function ScrollRegion({
  children,
  label,
  direction = "horizontal",
}: {
  children: ReactNode;
  label?: string;
  direction?: "horizontal" | "vertical" | "both";
}) {
  return (
    <div className="app-scroll-region" data-direction={direction} aria-label={label}>
      {children}
    </div>
  );
}
