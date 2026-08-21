import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Step = {
  value: string;
  label: string;
};

export default function FormSteps({
  items,
  value,
  onValueChange,
  label,
  children,
}: {
  items: readonly Step[];
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <div data-ui="form-steps">
      <nav aria-label={label} data-part="navigation">
        <ol data-part="list">
          {items.map((item, index) => {
            const active = item.value === value;

            return (
              <li key={item.value} data-state={active ? "active" : "inactive"}>
                <Button
                  type="button"
                  variant="ghost"
                  data-part="trigger"
                  aria-current={active ? "step" : undefined}
                  onClick={() => onValueChange(item.value)}
                >
                  <span data-part="number">{index + 1}</span>
                  <span data-part="label">{item.label}</span>
                </Button>
              </li>
            );
          })}
        </ol>
      </nav>
      <div data-part="content">{children}</div>
    </div>
  );
}
