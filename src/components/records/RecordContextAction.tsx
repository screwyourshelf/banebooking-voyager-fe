import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";

type Props = Omit<ComponentProps<typeof Button>, "size" | "variant">;

export default function RecordContextAction({ className, ...props }: Props) {
  return (
    <Button
      {...props}
      variant="ghost"
      size="sm"
      className={["record-collection__context-action", className].filter(Boolean).join(" ")}
    />
  );
}
