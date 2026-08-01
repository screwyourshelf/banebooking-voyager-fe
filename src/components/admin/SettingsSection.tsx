import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: ReactNode;
  children: ReactNode;
  embedded?: boolean;
  className?: string;
};

export default function SettingsSection({
  title,
  description,
  eyebrow,
  icon,
  children,
  embedded = false,
  className,
}: Props) {
  return (
    <section
      className={cn("settings-section", embedded && "settings-section--embedded", className)}
    >
      <header className="settings-section__header">
        {icon ? (
          <span className="settings-section__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span className="settings-section__heading">
          {eyebrow ? <span className="settings-section__eyebrow">{eyebrow}</span> : null}
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </span>
      </header>
      <div className="settings-section__body">{children}</div>
    </section>
  );
}
