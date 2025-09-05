import { ReactNode } from "react";

type PageSectionProps = {
  children: ReactNode;
  bordered?: boolean;   // gir topp-border + spacing
  className?: string;
};

export default function PageSection({
  children,
  bordered = false,
  className = "",
}: PageSectionProps) {
  return (
    <section
      className={`${bordered ? "border-t pt-4 mt-4" : ""} ${className}`}
    >
      {children}
    </section>
  );
}
