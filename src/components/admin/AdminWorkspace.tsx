import type { ReactNode } from "react";

export function AdminWorkspace({ children, section }: { children: ReactNode; section?: string }) {
  return (
    <div className="admin-workspace" data-section={section}>
      {children}
    </div>
  );
}

export function AdminResponsiveAction({
  children,
  placement,
}: {
  children: ReactNode;
  placement: "page" | "tabs";
}) {
  return (
    <div className="admin-responsive-action" data-placement={placement}>
      {children}
    </div>
  );
}
