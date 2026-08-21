import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;

  /** Standard: høyrejustert */
  align?: "left" | "right" | "between";

  /** Luft over actions */
  spaced?: boolean;

  /** Ny: sticky actions nederst på skjermen */
  variant?: "inline" | "sticky";
  embedded?: boolean;
  fullWidth?: boolean;
};

export default function FormActions({
  children,
  className,
  align = "right",
  spaced = false,
  variant = "inline",
  embedded = true,
  fullWidth = false,
}: Props) {
  return (
    <div
      className={className}
      data-ui="form-actions"
      data-align={align}
      data-spaced={spaced || undefined}
      data-variant={variant}
      data-embedded={embedded || undefined}
      data-full-width={fullWidth || undefined}
    >
      {children}
    </div>
  );
}
