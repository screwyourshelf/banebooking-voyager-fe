import type { FormHTMLAttributes, ReactNode } from "react";

type Props = Omit<FormHTMLAttributes<HTMLFormElement>, "children"> & {
  children: ReactNode;
  density?: "default" | "compact";
  variant?: "default" | "editor" | "settings";

  /** Standard: Enter submitter (for konsistent UX + viser validering) */
  submitOnEnter?: boolean;

  /**
   * Horisontal padding er ofte en "page concern", ikke form concern.
   * Bruk inset når formen lever inni f.eks dropdown.
   */
  inset?: "none" | "sm" | "md";
};

function isComposingEvent(e: React.KeyboardEvent) {
  const ne = e.nativeEvent;
  return "isComposing" in ne && Boolean((ne as { isComposing?: boolean }).isComposing);
}

export default function FormLayout({
  children,
  className,
  density = "default",
  variant = "default",
  submitOnEnter = true,
  inset = "none",
  onKeyDown,
  ...props
}: Props) {
  return (
    <form
      noValidate
      className={className}
      data-ui="form"
      data-variant={variant}
      data-density={density}
      data-inset={inset}
      onKeyDown={(e) => {
        onKeyDown?.(e);

        if (!submitOnEnter) return;
        if (e.defaultPrevented) return;
        if (e.key !== "Enter") return;
        if (isComposingEvent(e)) return;

        const el = e.target as HTMLElement;

        // Ikke kapre Enter i textarea
        if (el.tagName === "TEXTAREA") return;

        // Radix/SelectTrigger er ofte BUTTON → la den styre Enter selv
        if (el.tagName === "BUTTON") return;

        // Gir konsistent "Enter = submit" overalt, og trigget onSubmit -> validering
        e.preventDefault();
        (e.currentTarget as HTMLFormElement).requestSubmit?.();
      }}
      {...props}
    >
      {children}
    </form>
  );
}
