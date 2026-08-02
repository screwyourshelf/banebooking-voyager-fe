import { useLayoutEffect, type ReactNode } from "react";

export default function BootHandoff({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    document.getElementById("boot")?.remove();
  }, []);

  return children;
}
