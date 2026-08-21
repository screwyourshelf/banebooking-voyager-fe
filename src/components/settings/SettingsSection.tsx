import type { ReactNode } from "react";

export type SettingsSectionProps = {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  embedded?: boolean;
  tone?: "default" | "danger";
  className?: string;
};

export default function SettingsSection({
  title,
  description,
  eyebrow,
  children,
  embedded = false,
  tone = "default",
  className,
}: SettingsSectionProps) {
  return (
    <section
      className={className}
      data-ui="settings-section"
      data-embedded={embedded || undefined}
      data-tone={tone}
    >
      <header data-part="header">
        <span data-part="intro">
          <span data-part="eyebrow">{eyebrow}</span>
          <h2 data-part="title">{title}</h2>
          {description ? <p data-part="description">{description}</p> : null}
        </span>
      </header>
      <div data-part="content">{children}</div>
    </section>
  );
}
