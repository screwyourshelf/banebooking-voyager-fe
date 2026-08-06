import type { ReactNode } from "react";

import { AdminPage } from "@/components/admin";
import { RouteTabs, type RouteTabItem } from "@/components/navigation/Tabs";

export type BanerOgGrenerSection = "baner" | "grener";

type Props = {
  activeSection: BanerOgGrenerSection;
  availableSections: Record<BanerOgGrenerSection, boolean>;
  action?: ReactNode;
  children: ReactNode;
};

const sections: Array<RouteTabItem & { value: BanerOgGrenerSection }> = [
  {
    value: "baner",
    label: "Baner",
    to: "../baner",
  },
  {
    value: "grener",
    label: "Grener",
    to: "../grener",
  },
];

export default function BanerOgGrenerWorkspace({
  activeSection,
  availableSections,
  action,
  children,
}: Props) {
  const items = sections.filter((section) => availableSections[section.value]);

  return (
    <AdminPage
      eyebrow="Administrasjon"
      title="Baner og grener"
      description="Definer klubbens bookingtilbud og reglene som gjelder."
      action={action ? <div className="baner-og-grener__mobile-action">{action}</div> : undefined}
    >
      <div className="baner-og-grener-workspace" data-section={activeSection}>
        <RouteTabs
          ariaLabel="Baner og grener"
          items={items}
          value={activeSection}
          controls={
            action ? <div className="baner-og-grener__desktop-action">{action}</div> : undefined
          }
        >
          {children}
        </RouteTabs>
      </div>
    </AdminPage>
  );
}
