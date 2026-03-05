import { Link } from "react-router-dom";
import { useSlug } from "@/hooks/useSlug";

type Props = {
  klubbnavn: React.ReactNode;
};

export default function NavbarBrandMedKlubb({ klubbnavn }: Props) {
  const slug = useSlug();

  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");

  const klubbPath = `${base}/klubber/${slug}/img`;
  const defaultPath = `${base}/klubber/default/img`;

  return (
    <Link
      to={`/${slug}`}
      className="flex items-center gap-2 text-base font-semibold text-foreground hover:text-foreground/80"
    >
      <picture className="flex-shrink-0">
        {/* klubb svg */}
        <source srcSet={`${klubbPath}/logo.svg`} type="image/svg+xml" />

        {/* klubb webp */}
        <source srcSet={`${klubbPath}/logo.webp`} type="image/webp" />

        {/* default svg */}
        <source srcSet={`${defaultPath}/logo.svg`} type="image/svg+xml" />

        {/* default webp fallback */}
        <img
          src={`${defaultPath}/logo.webp`}
          alt=""
          width={32}
          height={32}
          loading="eager"
          decoding="async"
          className="h-8 w-auto max-w-8 object-contain rounded-sm"
        />
      </picture>

      {klubbnavn}
    </Link>
  );
}
