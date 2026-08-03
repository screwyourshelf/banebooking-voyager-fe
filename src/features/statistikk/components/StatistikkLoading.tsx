import CardSection from "@/components/layout/CardSection";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatistikkLoading() {
  return (
    <div className="statistics-loading" aria-label="Laster statistikk">
      <div className="statistics-loading__metrics">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="statistics-loading__metric" />
        ))}
      </div>
      <CardSection className="statistics-loading__chart">
        <Skeleton className="statistics-loading__title" />
        <Skeleton className="statistics-loading__plot" />
      </CardSection>
    </div>
  );
}
