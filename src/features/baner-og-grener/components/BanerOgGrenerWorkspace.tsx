import type { ReactNode } from "react";
import { Page, type PageProps } from "@/components";

import { RouteTabs, type RouteTabItem } from "@/components/navigation/Tabs";

export type BanerOgGrenerSection = "baner" | "grener";

type Props = {
  activeSection: BanerOgGrenerSection;
  availableSections: Record<BanerOgGrenerSection, boolean>;
  createAction?: PageProps["createAction"];
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
  createAction,
  children,
}: Props) {
  const items = sections.filter((section) => availableSections[section.value]);

  return (
    <Page
      eyebrow="Administrasjon"
      title="Baner og grener"
      description="Definer klubbens bookingtilbud og reglene som gjelder."
      createAction={createAction}
    >
      <RouteTabs ariaLabel="Baner og grener" items={items} value={activeSection}>
        {children}
      </RouteTabs>
    </Page>
  );
}
