import { Link } from "react-router-dom";
import { useSlug } from "@/hooks/useSlug";
import { useState } from "react";

type Props = {
  klubbnavn: React.ReactNode;
  tone?: "default" | "inverted";
  placement?: "default" | "topbar" | "sidebar";
  className?: string;
};

export default function NavbarBrandMedKlubb({
  klubbnavn,
  tone = "default",
  placement = "default",
  className,
}: Props) {
  const slug = useSlug();
  const base = import.meta.env.BASE_URL ?? "/";

  const klubbPath = `${base}klubber/${slug}/img`;
  const defaultPath = `${base}klubber/default/img`;

  const [src, setSrc] = useState(`${klubbPath}/logo.svg`);

  return (
    <Link to="." className={className} data-ui="brand" data-tone={tone} data-placement={placement}>
      <img
        src={src}
        alt=""
        width={48}
        height={48}
        data-part="logo"
        onError={() => {
          if (src.endsWith(".svg")) {
            setSrc(`${klubbPath}/logo.webp`);
          } else if (src.endsWith(".webp")) {
            setSrc(`${defaultPath}/logo.svg`);
          }
        }}
      />

      <span data-part="name">{klubbnavn}</span>
    </Link>
  );
}
