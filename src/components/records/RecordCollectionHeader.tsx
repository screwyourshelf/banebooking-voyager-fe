import type { ReactNode } from "react";
import FilterSwitch, { type FilterSwitchProps } from "@/components/controls/FilterSwitch";
import RecordFilterPanel, { type RecordFilterPanelProps } from "./RecordFilterPanel";

export type RecordCollectionToggle = FilterSwitchProps;
export type RecordCollectionFilter = RecordFilterPanelProps;

type Props = {
  icon: ReactNode;
  title: string;
  description?: string;
  summaryStatus?: ReactNode;
  toggle?: RecordCollectionToggle;
  filter?: RecordCollectionFilter;
};

export default function RecordCollectionHeader({
  icon,
  title,
  description,
  summaryStatus,
  toggle,
  filter,
}: Props) {
  return (
    <>
      <header className="control-surface record-collection__toolbar">
        <div className="record-collection__summary">
          <span className="record-collection__summary-icon" aria-hidden="true">
            {icon}
          </span>
          <span className="record-collection__summary-copy">
            <strong>{title}</strong>
            {description ? <small>{description}</small> : null}
            {summaryStatus ? (
              <span className="record-collection__summary-status">{summaryStatus}</span>
            ) : null}
          </span>
        </div>

        {toggle ? (
          <div className="record-collection__toolbar-actions">
            <FilterSwitch {...toggle} />
          </div>
        ) : null}
      </header>

      {filter ? <RecordFilterPanel {...filter} /> : null}
    </>
  );
}
