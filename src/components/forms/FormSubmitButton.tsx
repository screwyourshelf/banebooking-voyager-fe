import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;

  isLoading?: boolean;
  disabled?: boolean;

  /** default false: passer bedre i page-forms */
  fullWidth?: boolean;

  /** default sm: dere er mobile-first */
  size?: "sm" | "default" | "lg";

  /** tekst som vises når isLoading=true */
  loadingText?: ReactNode;

  className?: string;
};

export default function FormSubmitButton({
  children,
  isLoading = false,
  disabled,
  fullWidth = false,
  size = "sm",
  loadingText,
  className,
}: Props) {
  return (
    <Button
      type="submit"
      size={size}
      disabled={disabled || isLoading}
      className={cn(
        // “mobile-first” baseline
        "h-8 text-sm",
        fullWidth && "w-full",
        className
      )}
    >
      {isLoading ? (
        <>
          <Spinner />
          <span className="ml-2">{loadingText ?? children}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
