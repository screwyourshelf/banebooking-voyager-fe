import { CalendarCheck, Clock3, UsersRound } from "lucide-react";
import CardSection from "@/components/layout/CardSection";
import SectionHeading from "@/components/layout/SectionHeading";
import { RecordListState } from "@/components/records";
import { Card, CardContent } from "@/components/ui/card";
import type { BookingMedlemsstatistikk, Medlemsbookingtype } from "@/features/statistikk/types";
import {
  formatAntall,
  formatAntallMedEnhet,
  formatDesimaltall,
  formatTimer,
} from "@/features/statistikk/statistikkPresentation";

type Props = {
  medlemmer: BookingMedlemsstatistikk;
  bookingtype: Medlemsbookingtype;
};

const medlemsbeskrivelser: Record<
  Medlemsbookingtype,
  { aktive: string; rangering: string; tom: string }
> = {
  alle: {
    aktive: "Med minst én booking",
    rangering: "Rangert etter bookede timer i den valgte perioden.",
    tom: "Ingen brukere har bookinger med de valgte filtrene.",
  },
  vanlige: {
    aktive: "Med minst én vanlig booking",
    rangering: "Rangert etter bookede timer fra vanlige bookinger.",
    tom: "Ingen brukere har vanlige bookinger med de valgte filtrene.",
  },
  arrangement: {
    aktive: "Med minst én arrangementsbooking",
    rangering: "Rangert etter bookede timer for arrangement.",
    tom: "Ingen brukere har arrangementsbookinger med de valgte filtrene.",
  },
};

export default function Medlemsstatistikk({ medlemmer, bookingtype }: Props) {
  const beskrivelser = medlemsbeskrivelser[bookingtype];
  const nøkkeltall = [
    {
      label: "Aktive brukere",
      verdi: formatAntall(medlemmer.aktiveBrukere),
      enhet: "brukere",
      beskrivelse: beskrivelser.aktive,
      ikon: UsersRound,
    },
    {
      label: "Bookinger per bruker",
      verdi: `${formatDesimaltall(medlemmer.gjennomsnittBookingerPerBruker)} stk.`,
      beskrivelse: "Gjennomsnitt i perioden",
      ikon: CalendarCheck,
    },
    {
      label: "Timer per bruker",
      verdi: formatTimer(medlemmer.gjennomsnittBookedeTimerPerBruker),
      beskrivelse: "Gjennomsnitt i perioden",
      ikon: Clock3,
    },
  ];

  return (
    <div className="statistics-dashboard__tab-content">
      <section className="statistics-member-metrics" aria-label="Medlemsnøkkeltall">
        {nøkkeltall.map(({ label, verdi, enhet, beskrivelse, ikon: Ikon }) => (
          <Card key={label} size="sm" className="statistics-metric">
            <CardContent className="statistics-metric__content">
              <span className="statistics-metric__icon" aria-hidden="true">
                <Ikon />
              </span>
              <span className="statistics-metric__copy">
                <small>{label}</small>
                <strong>
                  {verdi}
                  {enhet ? <span className="statistics-metric__unit"> {enhet}</span> : null}
                </strong>
                <span>{beskrivelse}</span>
              </span>
            </CardContent>
          </Card>
        ))}
      </section>

      <CardSection className="statistics-section statistics-top-users" padding="sm">
        <div className="statistics-top-users__heading">
          <SectionHeading description={beskrivelser.rangering} size="lg">
            Topp 10 brukere
          </SectionHeading>
        </div>

        {medlemmer.toppBrukere.length === 0 ? (
          <RecordListState
            icon={<UsersRound aria-hidden="true" />}
            title="Ingen aktive brukere"
            description={beskrivelser.tom}
          />
        ) : (
          <div className="statistics-comparison-table" data-layout="users">
            <table>
              <thead>
                <tr>
                  <th scope="col" data-align="center">
                    #
                  </th>
                  <th scope="col">Bruker</th>
                  <th scope="col" data-align="end">
                    Timer
                  </th>
                  <th scope="col" data-align="end">
                    Bookinger
                  </th>
                </tr>
              </thead>
              <tbody>
                {medlemmer.toppBrukere.map((bruker, indeks) => {
                  const visningsnavn = bruker.navn.trim() || bruker.epost;
                  const visEpostSeparat =
                    bruker.epost.trim().toLocaleLowerCase("nb-NO") !==
                    visningsnavn.toLocaleLowerCase("nb-NO");

                  return (
                    <tr key={bruker.brukerId}>
                      <td data-align="center">{indeks + 1}</td>
                      <th scope="row">
                        <strong>{visningsnavn}</strong>
                        {visEpostSeparat ? <small>{bruker.epost}</small> : null}
                      </th>
                      <td data-align="end">{formatTimer(bruker.bookedeTimer)}</td>
                      <td data-align="end">
                        <strong>{formatAntallMedEnhet(bruker.antallBookinger)}</strong>
                        {bookingtype === "alle" ? (
                          <small>
                            P: {formatAntallMedEnhet(bruker.personligeBookinger)} · A:{" "}
                            {formatAntallMedEnhet(bruker.arrangementbookinger)}
                          </small>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardSection>
    </div>
  );
}
