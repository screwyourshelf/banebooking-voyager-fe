import type { ReactNode } from "react";

type Props = { children: ReactNode };

export default function ErrorShell({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <div className="flex flex-1 w-full max-w-screen-sm mx-auto px-2 py-5">
        <div className="flex flex-col w-full bg-card rounded-md shadow-sm overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
