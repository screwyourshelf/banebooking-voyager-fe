import { Link } from "react-router-dom";
import { useSlug } from "@/hooks/useSlug";
import { useState } from "react";

type Props = {
  klubbnavn: React.ReactNode;
};

export default function NavbarBrandMedKlubb({ klubbnavn }: Props) {
  const slug = useSlug();

  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");

  const logoSrc = `${base}/klubber/${slug}/img/logo.webp`;
  const fallbackLogo = `${base}/klubber/default/img/logo.webp`;

  const [src, setSrc] = useState(logoSrc);

  return (
    <Link
      to={`/${slug}`}
      className="flex items-center gap-2 text-base font-semibold text-foreground hover:text-foreground/80"
    >
      <img
        src={src}
        alt="Logo"
        width={32}
        height={32}
        loading="eager"
        decoding="async"
        className="h-8 w-8 rounded-sm"
        onError={() => setSrc(fallbackLogo)}
      />

      {klubbnavn}
    </Link>
  );
}
