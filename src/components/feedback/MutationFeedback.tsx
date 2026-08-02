import ActionFeedback from "./ActionFeedback";

type Props = {
  error?: Error | string | null;
  errorTitle?: string;
  success?: boolean;
  successTitle?: string;
  successDescription?: string;
};

export default function MutationFeedback({
  error,
  errorTitle = "Handlingen kunne ikke fullføres",
  success = false,
  successTitle = "Endringene er lagret",
  successDescription,
}: Props) {
  const errorMessage = typeof error === "string" ? error : error?.message;

  if (errorMessage) {
    return <ActionFeedback tone="danger" title={errorTitle} description={errorMessage} />;
  }

  if (success) {
    return <ActionFeedback tone="success" title={successTitle} description={successDescription} />;
  }

  return null;
}
