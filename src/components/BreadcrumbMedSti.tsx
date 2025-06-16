import { Link, useLocation, useParams } from "react-router-dom";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb.js";

const visningsnavn: Record<string, string> = {
    "minside": "Min side",
    "reglement": "Reglement",
    "admin": "Admin",
    "baner": "Baner",
    "brukere": "Brukere",
    "klubb": "Klubb",
    "arrangement": "Arrangement",
    "": "Book bane"
};

function oversettSegment(segment: string): string {
    const lower = segment.toLowerCase();
    return visningsnavn[lower] ?? capitalize(segment);
}

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function BreadcrumbMedSti() {
    const location = useLocation();
    const { slug } = useParams<{ slug?: string }>();

    const parts = location.pathname
        .split("/")
        .filter((part) => part && part !== slug);

    const pathSegments =
        parts.length > 0
            ? parts.map((part, idx) => ({
                segment: part,
                url: `/${[slug, ...parts.slice(0, idx + 1)].join("/")}`,
            }))
            : [{ segment: "", url: `/${slug}` }]; // Vis "Book bane" for index

    return (
        <Breadcrumb className="px-4 py-1">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to={`/${slug}`}>Hjem</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {pathSegments.map((siste, idx) => (
                    <span key={siste.url} className="flex items-center">
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            {idx === pathSegments.length - 1 || siste.segment === 'admin' ? (
                                <BreadcrumbPage>{oversettSegment(siste.segment)}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link to={siste.url}>{oversettSegment(siste.segment)}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                    </span>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
