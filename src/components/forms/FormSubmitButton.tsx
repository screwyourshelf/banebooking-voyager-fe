import type { ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      className={className}
      data-ui="form-submit"
      data-full-width={fullWidth || undefined}
    >
      {isLoading ? (
        <>
          <LoaderCircle data-ui="loading-spinner" aria-hidden="true" />
          <span>{loadingText ?? children}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
