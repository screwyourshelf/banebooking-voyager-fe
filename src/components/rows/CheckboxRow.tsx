import Row from "./Row";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  title: string;
  description?: string;

  checked: boolean;
  onCheckedChange: (checked: boolean) => void;

  disabled?: boolean;
  className?: string;
  density?: "default" | "compact";
};

export default function CheckboxRow({
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
      className={className}
      right={
        <Checkbox
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(!!v)}
          disabled={disabled}
        />
      }
    />
  );
}
