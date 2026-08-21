import { type ComponentProps, type InputHTMLAttributes, type ReactNode, useId } from "react";
import { Row, RowList, RowPanel, SwitchRow } from "@/components/rows";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ControlChoice from "@/components/controls/ControlChoice";

export function SettingsStack({
  children,
  embedded = false,
}: {
  children: ReactNode;
  embedded?: boolean;
}) {
  return (
    <div data-ui="settings-stack" data-embedded={embedded || undefined}>
      {children}
    </div>
  );
}

export function SettingsPanel({ children }: { children: ReactNode }) {
  return (
    <RowPanel data-ui="settings-panel">
      <RowList>{children}</RowList>
    </RowPanel>
  );
}

type RowProps = Omit<ComponentProps<typeof Row>, "className">;

export function SettingsRow(props: RowProps) {
  return <Row data-ui="settings-row" data-kind="default" {...props} />;
}

type SwitchRowProps = Omit<ComponentProps<typeof SwitchRow>, "className" | "density">;

export function SettingsSwitchRow(props: SwitchRowProps) {
  return <SwitchRow data-ui="settings-row" data-kind="switch" density="default" {...props} />;
}

export function SettingsValue({ children }: { children: ReactNode }) {
  return <strong data-ui="settings-value">{children}</strong>;
}

export function SettingsText({ children }: { children: ReactNode }) {
  return <div data-ui="settings-text">{children}</div>;
}

type RadioOption = {
  value: string;
  label: ReactNode;
  description?: ReactNode;
};

export function SettingsRadioGroup({
  label,
  options,
  value,
  onValueChange,
  disabled = false,
  layout = "grid",
}: {
  label: string;
  options: readonly RadioOption[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  layout?: "grid" | "stacked";
}) {
  const groupId = useId();

  return (
    <RadioGroup
      aria-label={label}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      data-ui="settings-radio-group"
      data-layout={layout}
    >
      {options.map((option) => {
        const optionId = `${groupId}-${option.value}`;

        return (
          <Label
            key={option.value}
            htmlFor={optionId}
            data-ui="settings-radio-option"
            data-selected={value === option.value}
            data-disabled={disabled || undefined}
          >
            <RadioGroupItem id={optionId} value={option.value} />
            <span data-part="content">
              <span data-part="label">{option.label}</span>
              {option.description ? (
                <span data-part="description">{option.description}</span>
              ) : null}
            </span>
          </Label>
        );
      })}
    </RadioGroup>
  );
}

type ChoiceOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

export function SettingsChoiceGroup({
  label,
  options,
  selectedValues,
  onToggle,
  disabled = false,
}: {
  label: string;
  options: readonly ChoiceOption[];
  selectedValues: readonly string[];
  onToggle: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div data-ui="settings-choice-group" role="group" aria-label={label}>
      {options.map((option) => (
        <ControlChoice
          key={option.value}
          selected={selectedValues.includes(option.value)}
          onClick={() => onToggle(option.value)}
          disabled={disabled || option.disabled}
        >
          {option.label}
        </ControlChoice>
      ))}
    </div>
  );
}

type RangeProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> & {
  labels?: ReactNode;
};

export function SettingsRange({ labels, ...props }: RangeProps) {
  return (
    <Field data-ui="settings-range">
      <input type="range" data-part="control" {...props} />
      {labels ? (
        <div data-part="labels" aria-hidden="true">
          {labels}
        </div>
      ) : null}
    </Field>
  );
}
