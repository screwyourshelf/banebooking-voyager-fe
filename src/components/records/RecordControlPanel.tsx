import { useId, useState, type ReactNode } from "react";
import { ListFilter, Search, X } from "lucide-react";
import ControlChoice from "@/components/controls/ControlChoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RenderControlProps = {
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
};

export type RecordControlOption = {
  value: string;
  label: ReactNode;
  renderControl?: (props: RenderControlProps) => ReactNode;
};

export type RecordControlGroup = {
  label: string;
  options: readonly RecordControlOption[];
  selectedValues: readonly string[];
  onToggle: (value: string) => void;
};

export type RecordSearchControl = {
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
};

export type RecordSortControl = {
  label: string;
  value: string;
  options: readonly RecordControlOption[];
  onValueChange: (value: string) => void;
};

export type RecordControlField = {
  id: string;
  label?: string;
  control: ReactNode;
  width?: "default" | "wide";
};

export type RecordControlPanelProps = {
  mode?: "filter" | "selection";
  label: string;
  groups?: readonly RecordControlGroup[];
  fields?: readonly RecordControlField[];
  search?: RecordSearchControl;
  sort?: RecordSortControl;
  onReset?: () => void;
  disabled?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: "panel" | "header";
  contentId?: string;
  indicator?: "default" | "activity";
};

export default function RecordControlPanel({
  mode = "filter",
  label,
  groups = [],
  fields = [],
  search,
  sort,
  onReset,
  disabled = false,
  defaultOpen = false,
  open,
  onOpenChange,
  trigger = "panel",
  contentId,
  indicator = "default",
}: RecordControlPanelProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const generatedContentId = useId();
  const searchId = useId();
  const panelOpen = open ?? internalOpen;
  const resolvedContentId = contentId ?? generatedContentId;
  const selectedCount = groups.reduce((count, group) => count + group.selectedValues.length, 0);
  const hasActiveFilters = selectedCount > 0 || Boolean(search?.value.trim());

  function handleOpenChange(nextOpen: boolean) {
    if (open === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  return (
    <section
      className="control-surface record-filter-panel"
      aria-label={label}
      data-mode={mode}
      data-trigger={trigger}
      data-indicator={indicator}
      data-has-search={Boolean(search)}
      data-has-sort={Boolean(sort)}
      data-open={panelOpen}
    >
      {trigger === "panel" ? (
        <div className="record-filter-panel__top">
          {search ? (
            <div className="record-filter-panel__search">
              <label className="sr-only" htmlFor={searchId}>
                {search.label}
              </label>
              <Search aria-hidden="true" />
              <Input
                id={searchId}
                type="search"
                value={search.value}
                onChange={(event) => search.onValueChange(event.target.value)}
                placeholder={search.placeholder}
                inputMode="search"
                autoComplete="off"
                disabled={disabled}
              />
              {search.value ? (
                <button
                  type="button"
                  className="record-filter-panel__clear-search"
                  aria-label="Tøm søket"
                  onClick={() => search.onValueChange("")}
                  disabled={disabled}
                >
                  <X aria-hidden="true" />
                </button>
              ) : null}
            </div>
          ) : (
            <span className="record-filter-panel__label">
              <ListFilter aria-hidden="true" />
              {label}
            </span>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="record-filter-panel__toggle"
            aria-expanded={panelOpen}
            aria-controls={resolvedContentId}
            onClick={() => handleOpenChange(!panelOpen)}
            disabled={disabled}
          >
            {mode === "selection" ? (panelOpen ? "Ferdig" : "Endre") : "Filtre"}
            {mode === "filter" && selectedCount > 0 ? (
              <span className="record-filter-panel__count">{selectedCount}</span>
            ) : null}
          </Button>
        </div>
      ) : null}

      <div id={resolvedContentId} className="record-filter-panel__content">
        {groups.map((group) => (
          <fieldset key={group.label} className="record-filter-panel__group">
            <legend>{group.label}</legend>
            <div className="record-filter-panel__choices">
              {group.options.map((option) => {
                const selected = group.selectedValues.includes(option.value);
                const onSelect = () => group.onToggle(option.value);

                return option.renderControl ? (
                  <span key={option.value} className="record-filter-panel__custom-control">
                    {option.renderControl({ selected, disabled, onSelect })}
                  </span>
                ) : (
                  <ControlChoice
                    key={option.value}
                    selected={selected}
                    onClick={onSelect}
                    disabled={disabled}
                  >
                    {option.label}
                  </ControlChoice>
                );
              })}
            </div>
          </fieldset>
        ))}

        {fields.map((field) => (
          <div
            key={field.id}
            className="record-filter-panel__field"
            data-width={field.width ?? "default"}
          >
            {field.label ? <span>{field.label}</span> : null}
            {field.control}
          </div>
        ))}

        {sort ? (
          <div className="record-filter-panel__sort">
            <span>{sort.label}</span>
            <Select value={sort.value} onValueChange={sort.onValueChange} disabled={disabled}>
              <SelectTrigger aria-label={sort.label}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sort.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {mode === "filter" && hasActiveFilters && onReset ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="record-filter-panel__reset"
            onClick={onReset}
            disabled={disabled}
          >
            Nullstill
          </Button>
        ) : null}
      </div>
    </section>
  );
}
