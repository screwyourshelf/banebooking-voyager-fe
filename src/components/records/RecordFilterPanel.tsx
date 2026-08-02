import { useId, useState, type ReactNode } from "react";
import { ListFilter, Search, X } from "lucide-react";
import ControlChoice from "@/components/controls/ControlChoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type RecordFilterOption = {
  value: string;
  label: ReactNode;
};

export type RecordFilterGroup = {
  label: string;
  options: readonly RecordFilterOption[];
  selectedValues: readonly string[];
  onToggle: (value: string) => void;
};

export type RecordSearchFilter = {
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
};

export type RecordFilterPanelProps = {
  label: string;
  groups: readonly RecordFilterGroup[];
  search?: RecordSearchFilter;
  onReset?: () => void;
  disabled?: boolean;
};

export default function RecordFilterPanel({
  label,
  groups,
  search,
  onReset,
  disabled = false,
}: RecordFilterPanelProps) {
  const [open, setOpen] = useState(false);
  const contentId = useId();
  const searchId = useId();
  const selectedCount = groups.reduce((count, group) => count + group.selectedValues.length, 0);
  const hasActiveFilters = selectedCount > 0 || Boolean(search?.value.trim());

  return (
    <section
      className="control-surface record-filter-panel"
      aria-label={label}
      data-has-search={Boolean(search)}
      data-open={open}
    >
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
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((current) => !current)}
          disabled={disabled}
        >
          Filtre
          {selectedCount > 0 ? (
            <span className="record-filter-panel__count">{selectedCount}</span>
          ) : null}
        </Button>
      </div>

      <div id={contentId} className="record-filter-panel__content">
        {groups.map((group) => (
          <fieldset key={group.label} className="record-filter-panel__group">
            <legend>{group.label}</legend>
            <div className="record-filter-panel__choices">
              {group.options.map((option) => (
                <ControlChoice
                  key={option.value}
                  selected={group.selectedValues.includes(option.value)}
                  onClick={() => group.onToggle(option.value)}
                  disabled={disabled}
                >
                  {option.label}
                </ControlChoice>
              ))}
            </div>
          </fieldset>
        ))}

        {hasActiveFilters && onReset ? (
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
