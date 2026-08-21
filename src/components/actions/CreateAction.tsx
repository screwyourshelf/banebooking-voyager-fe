import type { ButtonHTMLAttributes } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CreateActionProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  label: string;
};

export default function CreateAction({ label, type = "button", ...props }: CreateActionProps) {
  return (
    <Button type={type} {...props}>
      <Plus data-icon="inline-start" aria-hidden="true" />
      {label}
    </Button>
  );
}
