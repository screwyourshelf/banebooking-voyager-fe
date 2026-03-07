import { MapPinOff } from "lucide-react";
import ErrorShell from "@/app/ErrorShell";
import { ErrorDisplay } from "@/components/errors";

export default function NotFoundPage() {
  return (
    <ErrorShell>
      <ErrorDisplay
        icon={MapPinOff}
        title="Siden finnes ikke"
        description="Vi fant ikke siden du lette etter."
      />
    </ErrorShell>
  );
}
