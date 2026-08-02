import { useId } from "react";
import { Switch } from "@/components/ui/switch";

export type FilterSwitchProps = {
  title: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
};

export default function FilterSwitch({
  title,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: FilterSwitchProps) {
  const descriptionId = useId();

  return (
    <label className="filter-switch">
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
