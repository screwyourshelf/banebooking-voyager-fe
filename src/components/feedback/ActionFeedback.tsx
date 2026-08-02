import type { ReactNode } from "react";

export type ActionFeedbackTone = "success" | "info" | "warning" | "danger";

export type ActionFeedbackMessage = {
  tone: ActionFeedbackTone;
  title: string;
  description?: string;
};

type Props = ActionFeedbackMessage & {
  action?: ReactNode;
};

export default function ActionFeedback({ tone, title, description, action }: Props) {
  const isUrgent = tone === "danger";

  return (
    <div
      className="action-feedback"
      data-tone={tone}
      role={isUrgent ? "alert" : "status"}
      aria-live={isUrgent ? "assertive" : "polite"}
      aria-atomic="true"
    >
      <div className="action-feedback__copy">
        <strong className="action-feedback__title">{title}</strong>
        {description ? <p className="action-feedback__description">{description}</p> : null}
      </div>
      {action ? <div className="action-feedback__action">{action}</div> : null}
    </div>
  );
}
