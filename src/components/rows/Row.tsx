import type { ComponentProps, ReactNode } from "react";

type Props = Omit<ComponentProps<"div">, "title"> & {
  title?: ReactNode;
  description?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
  className?: string;
  density?: "default" | "compact";
};

export default function Row({
  title,
  description,
  right,
  children,
  className,
  density = "default",
  ...props
}: Props) {
  const hasHeader = !!title || !!description || !!right;

  return (
    <div className={className} data-layout="row" data-density={density} {...props}>
      {hasHeader ? (
        <div data-part="header">
          <div data-part="intro">
            {title ? <div data-part="title">{title}</div> : null}
            {description ? <div data-part="description">{description}</div> : null}
          </div>

          {right ? <div data-part="actions">{right}</div> : null}
        </div>
      ) : null}

      {children ? (
        <div data-part="content" data-has-header={hasHeader || undefined}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
