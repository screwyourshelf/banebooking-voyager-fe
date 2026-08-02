import type { ReactNode } from "react";

export type RecordFact = {
  label: string;
  value: ReactNode;
};

type Props = {
  items: readonly RecordFact[];
};

export default function RecordFacts({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <dl className="record-facts">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
