import { useId, useState } from "react";
import { ListFilter } from "lucide-react";
import ControlChoice from "@/components/controls/ControlChoice";
import { Button } from "@/components/ui/button";

type Option = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  options: Option[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  onReset: () => void;
  disabled?: boolean;
};

export default function RecordChoiceFilter({
  label,
  options,
  selectedValues,
  onToggle,
  onReset,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const filterId = useId();

  return (
    <section className="control-surface record-choice-filter" data-open={open}>
      <div className="record-choice-filter__mobile-heading">
        <span>
          <ListFilter aria-hidden="true" />
          Filtrer {label.toLocaleLowerCase("nb-NO")}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="record-choice-filter__toggle"
          aria-expanded={open}
          aria-controls={filterId}
          onClick={() => setOpen((current) => !current)}
          disabled={disabled}
        >
          Filtre
          {selectedValues.length > 0 ? (
            <span className="record-choice-filter__count">{selectedValues.length}</span>
          ) : null}
        </Button>
      </div>

      <fieldset id={filterId} className="record-choice-filter__content">
        <legend>{label}</legend>
        <div className="record-choice-filter__choices">
          {options.map((option) => (
            <ControlChoice
              key={option.value}
              selected={selectedValues.includes(option.value)}
              onClick={() => onToggle(option.value)}
              disabled={disabled}
            >
              {option.label}
            </ControlChoice>
          ))}
        </div>

        {selectedValues.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="record-choice-filter__reset"
            onClick={onReset}
            disabled={disabled}
          >
            Nullstill
          </Button>
        ) : null}
      </fieldset>
    </section>
  );
}
