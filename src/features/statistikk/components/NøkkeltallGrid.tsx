import { CalendarCheck, CalendarRange, Clock3, UsersRound } from "lucide-react";
import { MetricCard, MetricGrid } from "@/components/statistics";
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
      label: "Antall bookinger",
      value: formatAntall(nøkkeltall.antallBookinger),
      unit: "stk.",
      comparison: sammenligning
        ? `Året før: ${formatAntall(sammenligning.antallBookinger)} stk.`
        : null,
      icon: CalendarCheck,
    },
    {
      label: "Personlige bookinger",
      value: formatAntall(nøkkeltall.personligeBookinger),
      unit: "stk.",
      comparison: sammenligning
        ? `Året før: ${formatAntall(sammenligning.personligeBookinger)} stk.`
        : null,
      icon: UsersRound,
    },
    {
      label: "Bookinger for arrangement",
      value: formatAntall(nøkkeltall.arrangementbookinger),
      unit: "stk.",
      comparison: sammenligning
        ? `Året før: ${formatAntall(sammenligning.arrangementbookinger)} stk.`
        : null,
      icon: CalendarRange,
    },
  ];

  return (
    <MetricGrid label="Nøkkeltall">
      {kort.map(({ label, value, unit, comparison, change, icon: Icon }) => (
        <MetricCard
          key={label}
          label={label}
          value={value}
          unit={unit}
          description={comparison ?? "Valgt periode"}
          icon={<Icon />}
          change={change}
          direction={endringBookedeTimerProsent && endringBookedeTimerProsent < 0 ? "down" : "up"}
        />
      ))}
    </MetricGrid>
  );
}
