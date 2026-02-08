import type { FormHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = Omit<FormHTMLAttributes<HTMLFormElement>, "children"> & {
  children: ReactNode;
  density?: "default" | "compact";

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
  submitOnEnter = true,
  inset = "none",
  onKeyDown,
  ...props
}: Props) {
  const gap = density === "compact" ? "space-y-2" : "space-y-4";
  const px = inset === "sm" ? "px-2" : inset === "md" ? "px-4" : "";

  return (
    <form
      noValidate
      className={cn("w-full", gap, px, className)}
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
