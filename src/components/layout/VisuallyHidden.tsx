import type { ReactNode } from "react";

export default function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="app-visually-hidden">{children}</span>;
}
