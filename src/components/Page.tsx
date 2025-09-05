import { ReactNode } from "react";

/**
 * Enkel Page-wrapper:
 * - Setter samme max-bredde, margin og padding på alle sider
 * - Ingen tittel/header (breadcrumbs håndteres utenfor)
 */
type PageProps = {
  children: ReactNode;
  className?: string; // kun hvis man vil legge til *ekstra* klasser
};

export default function Page({ children, className = "" }: PageProps) {
  return (
    <div className={`max-w-screen-md mx-auto px-1 py-2 ${className}`}>
      {children}
    </div>
  );
}
