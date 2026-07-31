import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import ControlChoice from "@/components/controls/ControlChoice";
import type { MedlemskapFilterType, RolleType } from "@/features/brukere/types";
import { MEDLEMSKAP_FILTER_VALG, ROLLER } from "@/features/brukere/types";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  visSlettede: boolean;
  onVisSlettedeChange: (value: boolean) => void;
  rolleFilter: RolleType[];
  onToggleRolle: (rolle: RolleType) => void;
  medlemskapFilter: MedlemskapFilterType[];
  onToggleMedlemskap: (filter: MedlemskapFilterType) => void;
  onReset: () => void;
};

export default function BrukerFilterPanel({
  query,
  onQueryChange,
  visSlettede,
  onVisSlettedeChange,
  rolleFilter,
  onToggleRolle,
  medlemskapFilter,
  onToggleMedlemskap,
  onReset,
}: Props) {
  const [visFiltre, setVisFiltre] = useState(false);
  const antallAktiveFiltre = rolleFilter.length + medlemskapFilter.length + (visSlettede ? 1 : 0);
  const harAktiveValg = antallAktiveFiltre > 0 || query.trim().length > 0;

  return (
    <section className="control-surface user-filter-panel" aria-label="Søk og filtrer brukere">
      <div className="user-filter-panel__search-row">
        <label className="sr-only" htmlFor="brukersok">
          Søk etter bruker
        </label>
        <div className="user-filter-panel__search">
          <Search aria-hidden="true" />
          <Input
            id="brukersok"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Søk på navn eller e-post"
            inputMode="search"
            autoComplete="off"
          />
          {query ? (
            <button
              type="button"
              className="user-filter-panel__clear-search"
              aria-label="Tøm søket"
              onClick={() => onQueryChange("")}
            >
              <X aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div className="user-filter-panel__mobile-toggle-wrap">
          <Button
            type="button"
            variant="outline"
            className="user-filter-panel__mobile-toggle"
            aria-label={visFiltre ? "Skjul filtre" : "Vis filtre"}
            aria-expanded={visFiltre}
            aria-controls="brukerfiltre"
            onClick={() => setVisFiltre((vises) => !vises)}
          >
            <span className="user-filter-panel__mobile-toggle-label">Filtre</span>
            {antallAktiveFiltre > 0 ? (
              <span className="user-filter-panel__filter-count">{antallAktiveFiltre}</span>
            ) : null}
          </Button>
        </div>
      </div>

      <div id="brukerfiltre" className="user-filter-panel__filters" data-open={visFiltre}>
        <fieldset className="user-filter-panel__group">
          <legend>Rolle</legend>
          <div className="user-filter-panel__choices">
            {ROLLER.map((rolle) => {
              const aktiv = rolleFilter.includes(rolle);
              return (
                <ControlChoice
                  key={rolle}
                  className="user-filter-panel__choice"
                  selected={aktiv}
                  onClick={() => onToggleRolle(rolle)}
                >
                  {rolle}
                </ControlChoice>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="user-filter-panel__group">
          <legend>Medlemskap</legend>
          <div className="user-filter-panel__choices">
            {MEDLEMSKAP_FILTER_VALG.map((medlemskap) => {
              const aktiv = medlemskapFilter.includes(medlemskap.value);
              return (
                <ControlChoice
                  key={medlemskap.value}
                  className="user-filter-panel__choice"
                  selected={aktiv}
                  onClick={() => onToggleMedlemskap(medlemskap.value)}
                >
                  {medlemskap.label}
                </ControlChoice>
              );
            })}
          </div>
        </fieldset>

        <label className="user-filter-panel__deleted">
          <span>
            <strong>Vis slettede</strong>
            <small>Inkluder tidligere brukere</small>
          </span>
          <Switch checked={visSlettede} onCheckedChange={onVisSlettedeChange} />
        </label>

        {harAktiveValg ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="user-filter-panel__reset"
            onClick={onReset}
          >
            Nullstill
          </Button>
        ) : null}
      </div>
    </section>
  );
}
