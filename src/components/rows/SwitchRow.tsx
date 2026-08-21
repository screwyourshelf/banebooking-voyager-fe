import type { ComponentProps } from "react";
import Row from "./Row";
import { Switch } from "@/components/ui/switch";

type Props = Omit<ComponentProps<typeof Row>, "right" | "children"> & {
  title: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
};

export default function SwitchRow({
  title,
  description,
  checked,
  onCheckedChange,
  disabled = false,
  className,
  density = "compact",
  ...props
}: Props) {
  return (
    <Row
      title={title}
      description={description}
      density={density}
      className={className}
      data-control="switch"
      {...props}
      right={
        <Switch
          aria-label={title}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
      }
    />
  );
}
