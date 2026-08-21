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
      data-ui="action-feedback"
      data-tone={tone}
      role={isUrgent ? "alert" : "status"}
      aria-live={isUrgent ? "assertive" : "polite"}
      aria-atomic="true"
    >
      <div data-part="content">
        <strong data-part="title">{title}</strong>
        {description ? <p data-part="description">{description}</p> : null}
      </div>
      {action ? <div data-part="action">{action}</div> : null}
    </div>
  );
}
