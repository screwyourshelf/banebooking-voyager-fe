import { CalendarCheck, CalendarRange, Clock3, UsersRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { BookingstatistikkRespons } from "@/features/statistikk/types";
import {
  formatAntall,
  formatProsent,
  formatTimer,
} from "@/features/statistikk/statistikkPresentation";

type Props = {
  statistikk: BookingstatistikkRespons;
};

export default function NøkkeltallGrid({ statistikk }: Props) {
  const { nøkkeltall, sammenligning, endringBookedeTimerProsent } = statistikk;
  const endring = formatProsent(endringBookedeTimerProsent);

  const kort = [
    {
      label: "Bookede timer",
      value: formatTimer(nøkkeltall.bookedeTimer),
      comparison: sammenligning ? `Året før: ${formatTimer(sammenligning.bookedeTimer)}` : null,
      change: endring,
      icon: Clock3,
    },
    {
      label: "Bookinger",
      value: formatAntall(nøkkeltall.antallBookinger),
      comparison: sammenligning ? `Året før: ${formatAntall(sammenligning.antallBookinger)}` : null,
      icon: CalendarCheck,
    },
    {
      label: "Personlige",
      value: formatAntall(nøkkeltall.personligeBookinger),
      comparison: sammenligning
        ? `Året før: ${formatAntall(sammenligning.personligeBookinger)}`
        : null,
      icon: UsersRound,
    },
    {
      label: "Arrangement",
      value: formatAntall(nøkkeltall.arrangementbookinger),
      comparison: sammenligning
        ? `Året før: ${formatAntall(sammenligning.arrangementbookinger)}`
        : null,
      icon: CalendarRange,
    },
  ];

  return (
    <section className="statistics-metrics" aria-label="Nøkkeltall">
      {kort.map(({ label, value, comparison, change, icon: Icon }) => (
        <Card key={label} size="sm" className="statistics-metric">
          <CardContent className="statistics-metric__content">
            <span className="statistics-metric__icon" aria-hidden="true">
              <Icon />
            </span>
            <span className="statistics-metric__copy">
              <small>{label}</small>
              <strong>{value}</strong>
              {comparison ? <span>{comparison}</span> : <span>Valgt periode</span>}
            </span>
            {change ? (
              <span
                className="statistics-metric__change"
                data-direction={
                  endringBookedeTimerProsent && endringBookedeTimerProsent < 0 ? "down" : "up"
                }
              >
                {change}
              </span>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
