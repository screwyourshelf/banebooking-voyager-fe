import { ActionFeedback } from "@/components/feedback";

type Props = {
  feil?: string | null;
  title?: string;
};

export function ServerFeil({ feil, title }: Props) {
  if (!feil) return null;

  return (
    <ActionFeedback
      tone="danger"
      title={title ?? "Handlingen kunne ikke fullføres"}
      description={feil}
    />
  );
}
