import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ChoiceStripItem = {
  id: string;
  content: ReactNode;
  ariaLabel?: string;
  inactive?: boolean;
  statusText?: string;
  disabled?: boolean;
};

type Props = {
  ariaLabel: string;
  items: ChoiceStripItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
  divided?: boolean;
  className?: string;
};

export default function ChoiceStrip({
  ariaLabel,
  items,
  selectedId,
  onSelect,
  disabled = false,
  divided = true,
  className,
}: Props) {
  return (
    <div
      className={cn("choice-strip", className)}
      data-many={items.length > 3}
      data-divided={divided}
      role="group"
      aria-label={ariaLabel}
    >
      <div className="choice-strip__scroller">
        {items.map((item) => {
          const selected = item.id === selectedId;

          return (
            <button
              key={item.id}
              type="button"
              className="choice-strip__item"
              data-active={selected}
              data-inactive={item.inactive}
              aria-label={item.ariaLabel}
              aria-pressed={selected}
              disabled={disabled || item.disabled}
              onClick={() => onSelect(item.id)}
            >
              {item.content}
              {item.statusText ? <span className="sr-only">{item.statusText}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
