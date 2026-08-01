import type { ComponentProps, InputHTMLAttributes, ReactNode } from "react";
import { Row, RowList, RowPanel, SwitchRow } from "@/components/rows";
import { Field } from "@/components/ui/field";

export function SettingsStack({
  children,
  embedded = false,
}: {
  children: ReactNode;
  embedded?: boolean;
}) {
  return (
    <div className={embedded ? "settings-stack settings-stack--embedded" : "settings-stack"}>
      {children}
    </div>
  );
}

export function SettingsPanel({ children }: { children: ReactNode }) {
  return (
    <RowPanel className="settings-panel">
      <RowList>{children}</RowList>
    </RowPanel>
  );
}

type RowProps = Omit<ComponentProps<typeof Row>, "className">;

export function SettingsRow(props: RowProps) {
  return <Row className="settings-row" {...props} />;
}

type SwitchRowProps = Omit<ComponentProps<typeof SwitchRow>, "className" | "density">;

export function SettingsSwitchRow(props: SwitchRowProps) {
  return <SwitchRow className="settings-row settings-row--switch" density="default" {...props} />;
}

export function SettingsValue({ children }: { children: ReactNode }) {
  return <strong className="settings-row__value">{children}</strong>;
}

type RangeProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> & {
  labels?: ReactNode;
};

export function SettingsRange({ labels, ...props }: RangeProps) {
  return (
    <Field>
      <input type="range" className="settings-range" {...props} />
      {labels ? (
        <div className="settings-range__labels" aria-hidden="true">
          {labels}
        </div>
      ) : null}
    </Field>
  );
}
