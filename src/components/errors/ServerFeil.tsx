import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Props = {
  feil?: string | null;
};

export function ServerFeil({ feil }: Props) {
  if (!feil) return null;
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{feil}</AlertDescription>
    </Alert>
  );
}
