import { Skeleton } from "@/components/ui/skeleton";
import { Section } from "@/components";

export default function StatistikkLoading() {
  return (
    <div className="statistics-loading" aria-label="Laster statistikk">
      <div className="statistics-loading__metrics">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="statistics-loading__metric" />
        ))}
      </div>
      <Section variant="surface" className="statistics-loading__chart">
        <Skeleton className="statistics-loading__title" />
        <Skeleton className="statistics-loading__plot" />
      </Section>
    </div>
  );
}
