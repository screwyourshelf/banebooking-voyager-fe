import { Link } from 'react-router-dom';

type Props = {
    slug?: string;
    klubbnavn: React.ReactNode;
};

export default function NavbarBrandMedKlubb({ slug, klubbnavn }: Props) {
    const base = import.meta.env.BASE_URL;

    const logoSrc = slug
        ? `${base}klubber/${slug}/img/logo.webp`
        : `${base}klubber/default/img/logo.webp`;

    return (
        <Link
            to={slug ? `/${slug}` : '/'}
            className="flex items-center gap-2 text-base font-semibold text-gray-800 hover:text-black"
        >
            <img
                src={logoSrc}
                onError={(e) => {
                    e.currentTarget.src = `${base}klubber/default/img/logo.webp`;
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
