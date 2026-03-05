import { Link, useLocation, useParams } from "react-router-dom";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { getBreadcrumbName } from "@/routes/routeConfig";

export default function BreadcrumbMedSti() {
  const location = useLocation();
  const { slug } = useParams<{ slug?: string }>();

  const parts = location.pathname.split("/").filter((p) => p && p !== slug);

  const segments = parts.map((part, idx) => ({
    segment: part,
    name: getBreadcrumbName(part),
    url: `/${[slug, ...parts.slice(0, idx + 1)].join("/")}`,
    isLast: idx === parts.length - 1,
    isAdmin: part === "admin",
  }));

  return (
    <Breadcrumb aria-label="Brødsmulesti" className="px-4 py-1">
      <BreadcrumbList>
        {/* Hjem */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to={`/${slug}`}>Hjem</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment) => (
          <Fragment key={segment.url}>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
              {segment.isLast || segment.isAdmin ? (
                <BreadcrumbPage>{segment.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={segment.url}>{segment.name}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
