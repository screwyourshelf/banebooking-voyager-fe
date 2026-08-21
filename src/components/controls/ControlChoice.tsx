import type { ButtonHTMLAttributes } from "react";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed"> & {
  selected: boolean;
};

export default function ControlChoice({ selected, className, children, ...props }: Props) {
  return (
    <button
      type="button"
      className={className}
      data-ui="control-choice"
      data-selected={selected}
      aria-pressed={selected}
      {...props}
    >
      {children}
    </button>
  );
}
