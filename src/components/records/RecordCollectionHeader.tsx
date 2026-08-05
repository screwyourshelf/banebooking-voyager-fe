import type { ReactNode } from "react";
import FilterSwitch, { type FilterSwitchProps } from "@/components/controls/FilterSwitch";
import RecordControlPanel, { type RecordControlPanelProps } from "./RecordControlPanel";

export type RecordCollectionToggle = FilterSwitchProps;
export type RecordCollectionFilter = Omit<
  RecordControlPanelProps,
  "mode" | "open" | "onOpenChange" | "trigger" | "contentId" | "indicator"
>;
export type RecordCollectionSelection = Pick<
  RecordControlPanelProps,
  "label" | "groups" | "disabled" | "indicator"
>;

type Props = {
  icon: ReactNode;
  title: string;
  description?: string;
  summaryStatus?: ReactNode;
  contextAction?: ReactNode;
  toggle?: RecordCollectionToggle;
  filter?: RecordCollectionFilter;
  selection?: RecordCollectionSelection;
};

export default function RecordCollectionHeader({
  icon,
  title,
  description,
  summaryStatus,
  contextAction,
  toggle,
  filter,
  selection,
}: Props) {
  return (
    <>
      <header
        className="control-surface record-collection__toolbar"
        data-has-context-action={contextAction ? "true" : undefined}
      >
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

        {contextAction || toggle ? (
          <div className="record-collection__toolbar-actions">
            {contextAction}
            {toggle ? <FilterSwitch {...toggle} /> : null}
          </div>
        ) : null}
      </header>

      {selection ? (
        <RecordControlPanel mode="selection" {...selection} open trigger="header" />
      ) : null}
      {filter ? <RecordControlPanel mode="filter" {...filter} /> : null}
    </>
  );
}
