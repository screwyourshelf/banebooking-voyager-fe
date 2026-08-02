import Row from "./Row";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  density?: "default" | "compact";
};

export default function SwitchRow({
  title,
  description,
  checked,
  onCheckedChange,
  disabled = false,
  className,
  density = "compact",
}: Props) {
  return (
    <Row
      title={title}
      description={description}
      density={density}
      className={cn("switch-row", className)}
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
