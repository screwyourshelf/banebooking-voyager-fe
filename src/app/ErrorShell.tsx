import type { ReactNode } from "react";

type Props = { children: ReactNode };

export default function ErrorShell({ children }: Props) {
  return (
    <div className="error-shell">
      <main className="error-shell__main">{children}</main>
    </div>
  );
}
