import { Link } from "react-router-dom";
import { useSlug } from "@/hooks/useSlug";
import { useState } from "react";

type Props = {
  klubbnavn: React.ReactNode;
};

export default function NavbarBrandMedKlubb({ klubbnavn }: Props) {
  const slug = useSlug();
  const base = import.meta.env.BASE_URL ?? "/";

  const klubbPath = `${base}klubber/${slug}/img`;
  const defaultPath = `${base}klubber/default/img`;

  const [src, setSrc] = useState(`${klubbPath}/logo.svg`);

  return (
    <Link
      to={`/${slug}`}
      className="flex items-center gap-2 text-base font-semibold text-foreground hover:text-foreground/80"
    >
      <img
        src={src}
        alt=""
        width={48}
        height={48}
        className="h-12 w-12 object-contain rounded-sm"
        onError={() => {
          if (src.endsWith(".svg")) {
            setSrc(`${klubbPath}/logo.webp`);
          } else if (src.endsWith(".webp")) {
            setSrc(`${defaultPath}/logo.svg`);
          }
        }}
      />

      {klubbnavn}
    </Link>
  );
}
