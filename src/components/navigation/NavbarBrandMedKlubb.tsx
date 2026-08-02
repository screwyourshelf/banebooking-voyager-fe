import { Link } from "react-router-dom";
import { useSlug } from "@/hooks/useSlug";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  klubbnavn: React.ReactNode;
  tone?: "default" | "inverted";
  className?: string;
};

export default function NavbarBrandMedKlubb({ klubbnavn, tone = "default", className }: Props) {
  const slug = useSlug();
  const base = import.meta.env.BASE_URL ?? "/";

  const klubbPath = `${base}klubber/${slug}/img`;
  const defaultPath = `${base}klubber/default/img`;

  const [src, setSrc] = useState(`${klubbPath}/logo.svg`);

  return (
    <Link
      to="."
      className={cn(
        "navbar-brand flex items-center gap-2 text-base font-semibold",
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
        className="h-11 w-11 rounded-sm object-contain"
        onError={() => {
          if (src.endsWith(".svg")) {
            setSrc(`${klubbPath}/logo.webp`);
          } else if (src.endsWith(".webp")) {
            setSrc(`${defaultPath}/logo.svg`);
          }
        }}
      />

      <span className="navbar-brand__name">{klubbnavn}</span>
    </Link>
  );
}
