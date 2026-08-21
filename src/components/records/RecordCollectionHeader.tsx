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
  "label" | "groups" | "fields" | "disabled" | "indicator"
>;

type Props = {
  icon: ReactNode;
  title: string;
  scope?: ReactNode;
  notice?: ReactNode;
  contextAction?: ReactNode;
  toggle?: RecordCollectionToggle;
  filter?: RecordCollectionFilter;
  selection?: RecordCollectionSelection;
};

export default function RecordCollectionHeader({
  icon,
  title,
  scope,
  notice,
  contextAction,
  toggle,
  filter,
  selection,
}: Props) {
  return (
    <>
      <header
        data-ui="record-collection-header"
        data-surface="control"
        data-has-context-action={contextAction ? "true" : undefined}
      >
        <div data-part="summary">
          <span data-part="icon" aria-hidden="true">
            {icon}
          </span>
          <span data-part="content">
            <strong>{title}</strong>
            {scope ? <small>{scope}</small> : null}
            {notice ? <span data-part="notice">{notice}</span> : null}
          </span>
        </div>

        {contextAction || toggle ? (
          <div data-part="actions">
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
