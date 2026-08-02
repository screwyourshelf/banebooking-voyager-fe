import type { ReactNode } from "react";
import { SearchX, UsersRound } from "lucide-react";
import { usePagination } from "@/hooks/usePagination";
import { AdminEntityCollection } from "@/components/admin";
import {
  RecordAccordionList,
  RecordCollectionPagination,
  RecordCollectionSkeleton,
  RecordListState,
  RecordStatus,
} from "@/components/records";
import { Button } from "@/components/ui/button";
import { MEDLEMSKAP_FILTER_VALG } from "@/features/brukere/types";
import type { BrukerRespons, MedlemskapFilterType, RolleType } from "@/features/brukere/types";
import { ROLLE_VALG } from "@/utils/brukerPresentation";
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
  const antallTekst = lasterListe
    ? "Laster brukere…"
    : `${filtrerteBrukere.length} ${filtrerteBrukere.length === 1 ? "bruker" : "brukere"}`;

  return (
    <AdminEntityCollection
      icon={<UsersRound aria-hidden="true" />}
      title={antallTekst}
      description="Medlemskap, roller og tilgang"
      summaryStatus={
        !lasterListe && antallTilOppfølging > 0 ? (
          <RecordStatus tone="warning">{antallTilOppfølging} trenger oppfølging</RecordStatus>
        ) : undefined
      }
      toggle={{
        title: "Vis slettede",
        checked: visSlettede,
        onCheckedChange: onVisSlettedeChange,
        disabled: lasterListe,
      }}
      filter={{
        label: "Filtrer brukere",
        search: {
          label: "Søk etter bruker",
          placeholder: "Søk på navn eller e-post",
          value: query,
          onValueChange: onQueryChange,
        },
        groups: [
          {
            label: "Rolle",
            options: ROLLE_VALG,
            selectedValues: rolleFilter,
            onToggle: (value) => onToggleRolle(value as RolleType),
          },
          {
            label: "Medlemskap",
            options: MEDLEMSKAP_FILTER_VALG,
            selectedValues: medlemskapFilter,
            onToggle: (value) => onToggleMedlemskap(value as MedlemskapFilterType),
          },
        ],
        onReset: onResetFilters,
      }}
    >
      {lasterListe ? (
        <RecordCollectionSkeleton ariaLabel="Laster brukere" rows={6} />
      ) : filtrerteBrukere.length === 0 ? (
        <RecordListState
          icon={<SearchX aria-hidden="true" />}
          title="Ingen brukere funnet"
          description="Prøv et annet søk eller fjern noen av filtrene."
          action={
            harAktiveFiltre ? (
              <Button type="button" variant="outline" size="sm" onClick={onResetFilters}>
                Nullstill filtre
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <RecordAccordionList ariaLabel="Brukere">
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
          </RecordAccordionList>

          {harFlere ? (
            <RecordCollectionPagination>
              <Button variant="outline" size="sm" onClick={visFlere}>
                Vis flere ({gjenstaar} gjenstår)
              </Button>
            </RecordCollectionPagination>
          ) : null}
        </>
      )}
    </AdminEntityCollection>
  );
}
