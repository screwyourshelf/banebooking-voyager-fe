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
    <label data-ui="filter-switch">
      <span data-part="content">
        <strong data-part="title">{title}</strong>
        {description ? (
          <small id={descriptionId} data-part="description">
            {description}
          </small>
        ) : null}
      </span>
      <Switch
        data-part="control"
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label={title}
        aria-describedby={description ? descriptionId : undefined}
      />
    </label>
  );
}
