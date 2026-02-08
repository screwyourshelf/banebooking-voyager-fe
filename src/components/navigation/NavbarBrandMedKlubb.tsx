import { Link } from "react-router-dom";
import { useSlug } from "@/hooks/useSlug";

type Props = {
  klubbnavn: React.ReactNode;
};

export default function NavbarBrandMedKlubb({ klubbnavn }: Props) {
  const slug = useSlug();
  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");

  const logoSrc = `${base}/klubber/${slug}/img/logo.webp`;
  const fallbackLogo = `${base}/klubber/default/img/logo.webp`;

  return (
    <Link
      to={`/${slug}`}
      className="flex items-center gap-2 text-base font-semibold text-gray-800 hover:text-black"
    >
      <img
        src={logoSrc}
        onError={(e) => {
          e.currentTarget.src = fallbackLogo;
        }}
        alt="Logo"
        width={32}
        height={32}
        className="h-8 w-8 rounded-sm"
      />
      {klubbnavn}
    </Link>
  );
}
