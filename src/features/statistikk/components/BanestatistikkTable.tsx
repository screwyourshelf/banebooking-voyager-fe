import CardSection from "@/components/layout/CardSection";
import SectionHeading from "@/components/layout/SectionHeading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BookingPerBane } from "@/features/statistikk/types";
import {
  formatAntallMedEnhet,
  formatProsent,
  formatTimer,
} from "@/features/statistikk/statistikkPresentation";

type Props = {
  baner: BookingPerBane[];
};

export default function BanestatistikkTable({ baner }: Props) {
  return (
    <CardSection className="statistics-section statistics-court-table" padding="sm">
      <div className="statistics-court-table__heading">
        <SectionHeading description="Bookede timer og type booking for hver bane." size="lg">
          Baner
        </SectionHeading>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bane</TableHead>
            <TableHead>Gren</TableHead>
            <TableHead className="statistics-table__numeric">Timer</TableHead>
            <TableHead className="statistics-table__numeric">Bookinger</TableHead>
            <TableHead className="statistics-table__numeric">Personlige</TableHead>
            <TableHead className="statistics-table__numeric">Arrangement</TableHead>
            <TableHead className="statistics-table__numeric">Året før</TableHead>
            <TableHead className="statistics-table__numeric">Endring</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {baner.map((bane) => {
            const endring = formatProsent(bane.endringBookedeTimerProsent);
            return (
              <TableRow key={bane.baneId}>
                <TableCell className="statistics-court-table__name">{bane.baneNavn}</TableCell>
                <TableCell>{bane.grenNavn}</TableCell>
                <TableCell className="statistics-table__numeric">
                  {formatTimer(bane.bookedeTimer)}
                </TableCell>
                <TableCell className="statistics-table__numeric">
                  {formatAntallMedEnhet(bane.antallBookinger)}
                </TableCell>
                <TableCell className="statistics-table__numeric">
                  {formatAntallMedEnhet(bane.personligeBookinger)}
                </TableCell>
                <TableCell className="statistics-table__numeric">
                  {formatAntallMedEnhet(bane.arrangementbookinger)}
                </TableCell>
                <TableCell className="statistics-table__numeric">
                  {bane.sammenligningBookedeTimer === null
                    ? "—"
                    : formatTimer(bane.sammenligningBookedeTimer)}
                </TableCell>
                <TableCell
                  className="statistics-table__numeric statistics-court-table__change"
                  data-direction={
                    bane.endringBookedeTimerProsent === null
                      ? undefined
                      : bane.endringBookedeTimerProsent < 0
                        ? "down"
                        : "up"
                  }
                >
                  {endring ?? "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="statistics-comparison-table" data-layout="courts">
        <table aria-label="Sammenligning av baner">
          <thead>
            <tr>
              <th scope="col">Bane</th>
              <th scope="col" data-align="end">
                Timer
              </th>
              <th scope="col" data-align="end">
                Bookinger
              </th>
            </tr>
          </thead>
          <tbody>
            {baner.map((bane) => {
              const endring = formatProsent(bane.endringBookedeTimerProsent);
              const retning =
                bane.endringBookedeTimerProsent === null
                  ? undefined
                  : bane.endringBookedeTimerProsent < 0
                    ? "down"
                    : "up";

              return (
                <tr key={bane.baneId}>
                  <th scope="row">
                    <strong>{bane.baneNavn}</strong>
                    <small>{bane.grenNavn}</small>
                  </th>
                  <td data-align="end">
                    <strong>{formatTimer(bane.bookedeTimer)}</strong>
                    <small>
                      {bane.sammenligningBookedeTimer === null
                        ? "Ingen sammenligning"
                        : `Før: ${formatTimer(bane.sammenligningBookedeTimer)}`}
                      {endring ? <span data-direction={retning}> · {endring}</span> : null}
                    </small>
                  </td>
                  <td data-align="end">
                    <strong>{formatAntallMedEnhet(bane.antallBookinger)}</strong>
                    <small>
                      P: {formatAntallMedEnhet(bane.personligeBookinger)} · A:{" "}
                      {formatAntallMedEnhet(bane.arrangementbookinger)}
                    </small>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </CardSection>
  );
}
