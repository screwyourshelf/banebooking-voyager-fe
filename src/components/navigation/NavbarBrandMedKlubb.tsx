import { Link } from "react-router-dom";
import { useSlug } from "@/hooks/useSlug";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  klubbnavn: React.ReactNode;
  tone?: "default" | "inverted";
  className?: string;
  logoClassName?: string;
};

export default function NavbarBrandMedKlubb({
  klubbnavn,
  tone = "default",
  className,
  logoClassName,
}: Props) {
  const slug = useSlug();
  const base = import.meta.env.BASE_URL ?? "/";

  const klubbPath = `${base}klubber/${slug}/img`;
  const defaultPath = `${base}klubber/default/img`;

  const [src, setSrc] = useState(`${klubbPath}/logo.svg`);

  return (
    <Link
      to="."
      className={cn(
        "flex min-w-0 items-center gap-2 font-medium",
        tone === "inverted"
          ? "text-white hover:text-white/85"
          : "text-foreground hover:text-foreground/80",
        className
      )}
    >
      <img
        src={src}
        alt=""
        width={48}
        height={48}
        className={cn("size-8 shrink-0 rounded-lg object-contain", logoClassName)}
        onError={() => {
          if (src.endsWith(".svg")) {
            setSrc(`${klubbPath}/logo.webp`);
          } else if (src.endsWith(".webp")) {
            setSrc(`${defaultPath}/logo.svg`);
          }
        }}
      />

      <span className="truncate">{klubbnavn}</span>
    </Link>
  );
}
