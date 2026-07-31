import { useId } from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

type Props = {
  title: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export default function FilterSwitch({
  title,
  description,
  checked,
  onCheckedChange,
  disabled = false,
  className,
}: Props) {
  const descriptionId = useId();

  return (
    <label className={cn("filter-switch", className)}>
      <span className="filter-switch__copy">
        <strong className="filter-switch__title">{title}</strong>
        {description ? (
          <small id={descriptionId} className="filter-switch__description">
            {description}
          </small>
        ) : null}
      </span>
      <Switch
        className="filter-switch__control"
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label={title}
        aria-describedby={description ? descriptionId : undefined}
      />
    </label>
  );
}
