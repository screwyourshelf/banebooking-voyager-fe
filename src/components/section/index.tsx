import type { ComponentProps, ReactNode } from "react";

type SectionProps = Omit<ComponentProps<"section">, "title" | "children"> & {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  variant?: "soft" | "surface" | "plain";
  padding?: "sm" | "md" | "lg";
};

function SectionRoot({
  title,
  description,
  actions,
  children,
  className,
  variant = "soft",
  padding = "md",
  ...props
}: SectionProps) {
  const showHeader = Boolean(title || description || actions);

  return (
    <section
      {...props}
      className={className}
      data-ui="section"
      data-variant={variant}
      data-padding={padding}
    >
      {showHeader ? (
        <Heading actions={actions} description={description}>
          {title}
        </Heading>
      ) : null}
      <div data-part="content">{children}</div>
    </section>
  );
}

function Heading({
  children,
  description,
  actions,
  className,
}: {
  children?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={className} data-ui="section-header">
      <div data-part="intro">
        {children ? <h2 data-part="title">{children}</h2> : null}
        {description ? <p data-part="description">{description}</p> : null}
      </div>
      {actions ? <div data-part="actions">{actions}</div> : null}
    </header>
  );
}

const Section = Object.assign(SectionRoot, { Heading });

export default Section;
