import type { ReactNode } from "react";
import { CircleAlert, SearchX, UsersRound } from "lucide-react";
import { usePagination } from "@/hooks/usePagination";
import { Inline } from "@/components/layout";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import type { BrukerRespons, MedlemskapFilterType, RolleType } from "@/features/brukere/types";
import BrukerFilterPanel from "./BrukerFilterPanel";
import BrukerListeRad from "./BrukerListeRad";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  visSlettede: boolean;
  onVisSlettedeChange: (value: boolean) => void;
  rolleFilter: RolleType[];
  onToggleRolle: (rolle: RolleType) => void;
  medlemskapFilter: MedlemskapFilterType[];
  onToggleMedlemskap: (filter: MedlemskapFilterType) => void;
  onResetFilters: () => void;
  filtrerteBrukere: BrukerRespons[];
  lasterListe: boolean;
  currentBrukerId: string | undefined;
  erKlubbAdmin: boolean;
  onRedigerBruker: (bruker: BrukerRespons) => void;
  renderSlettAction?: (bruker: BrukerRespons) => ReactNode;
  renderSperrAction?: (bruker: BrukerRespons) => ReactNode;
  onÅpneSperreHistorikk?: (bruker: BrukerRespons) => void;
};

export default function BrukereListeContent({
  query,
  onQueryChange,
  visSlettede,
  onVisSlettedeChange,
  rolleFilter,
  onToggleRolle,
  medlemskapFilter,
  onToggleMedlemskap,
  onResetFilters,
  filtrerteBrukere,
  lasterListe,
  currentBrukerId,
  erKlubbAdmin,
  onRedigerBruker,
  renderSlettAction,
  renderSperrAction,
  onÅpneSperreHistorikk,
}: Props) {
  const filterKey = `${query}|${visSlettede}|${rolleFilter.join(",")}|${medlemskapFilter.join(",")}`;
  const {
    synlige: synligeBrukere,
    harFlere,
    gjenstaar,
    visFlere,
  } = usePagination(filtrerteBrukere, 20, filterKey);

  const harAktiveFiltre =
    query.trim().length > 0 || visSlettede || rolleFilter.length > 0 || medlemskapFilter.length > 0;
  const antallTilOppfølging = filtrerteBrukere.filter(
    (bruker) => bruker.erSperret || bruker.måBekrefteMedlemskap
  ).length;
  const antallTekst = `${filtrerteBrukere.length} ${filtrerteBrukere.length === 1 ? "bruker" : "brukere"}`;

  return (
    <section className="user-directory" aria-label="Brukeroversikt">
      <BrukerFilterPanel
        query={query}
        onQueryChange={onQueryChange}
        visSlettede={visSlettede}
        onVisSlettedeChange={onVisSlettedeChange}
        rolleFilter={rolleFilter}
        onToggleRolle={onToggleRolle}
        medlemskapFilter={medlemskapFilter}
        onToggleMedlemskap={onToggleMedlemskap}
        onReset={onResetFilters}
      />

      <div className="user-directory__result-heading" aria-live="polite">
        <div>
          <UsersRound aria-hidden="true" />
          <span>
            <strong>{antallTekst}</strong>
            <small>{harAktiveFiltre ? "treffer valgene dine" : "registrert i klubben"}</small>
          </span>
        </div>

        {antallTilOppfølging > 0 ? (
          <span className="user-directory__attention">
            <CircleAlert aria-hidden="true" />
            {antallTilOppfølging} trenger oppfølging
          </span>
        ) : null}
      </div>

      {lasterListe ? (
        <div className="user-directory__state" role="status">
          Laster brukere…
        </div>
      ) : filtrerteBrukere.length === 0 ? (
        <div className="user-directory__empty">
          <SearchX aria-hidden="true" />
          <strong>Ingen brukere funnet</strong>
          <p>Prøv et annet søk eller fjern noen av filtrene.</p>
          {harAktiveFiltre ? (
            <Button type="button" variant="outline" size="sm" onClick={onResetFilters}>
              Nullstill filtre
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="user-directory__table-heading" aria-hidden="true">
            <span>Bruker</span>
            <span>Rolle</span>
            <span>Medlemskap</span>
            <span>Status</span>
            <span />
          </div>

          <Accordion type="single" collapsible className="record-list user-directory__list">
            {synligeBrukere.map((bruker) => (
              <BrukerListeRad
                key={bruker.id}
                bruker={bruker}
                currentBrukerId={currentBrukerId}
                erKlubbAdmin={erKlubbAdmin}
                onRedigerBruker={onRedigerBruker}
                renderSlettAction={renderSlettAction}
                renderSperrAction={renderSperrAction}
                onÅpneSperreHistorikk={onÅpneSperreHistorikk}
              />
            ))}
          </Accordion>

          {harFlere ? (
            <Inline justify="center" className="user-directory__pagination">
              <Button variant="outline" size="sm" onClick={visFlere}>
                Vis flere ({gjenstaar} gjenstår)
              </Button>
            </Inline>
          ) : null}
        </>
      )}
    </section>
  );
}
