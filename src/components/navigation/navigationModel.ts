import {
  CalendarCheck,
  CalendarCog,
  CalendarDays,
  CalendarPlus,
  CircleUser,
  Megaphone,
  Settings,
  Shapes,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";

export type NavigationSectionId = "overview" | "personal" | "admin";

export type AppNavigationItem = {
  id: string;
  to: string;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  section: NavigationSectionId;
  end?: boolean;
  requiresAuth?: boolean;
  requiredAnyCapability?: string[];
  mobilePrimaryOrder?: number;
  activePaths?: string[];
};

export type AppNavigationSection = {
  id: NavigationSectionId;
  label: string;
  items: AppNavigationItem[];
};

const navigationItems: AppNavigationItem[] = [
  {
    id: "booking",
    to: ".",
    label: "Book bane",
    icon: CalendarPlus,
    section: "overview",
    end: true,
    mobilePrimaryOrder: 1,
  },
  {
    id: "activities",
    to: "arrangementer",
    label: "Arrangementer",
    icon: CalendarDays,
    section: "overview",
    end: true,
    mobilePrimaryOrder: 3,
  },
  {
    id: "my-bookings",
    to: "bookinger",
    label: "Mine tider",
    icon: CalendarCheck,
    section: "personal",
    end: true,
    requiresAuth: true,
    mobilePrimaryOrder: 2,
  },
  {
    id: "profile",
    to: "minside",
    label: "Min side",
    icon: CircleUser,
    section: "personal",
    end: true,
    requiresAuth: true,
  },
  {
    id: "users",
    to: "admin/brukere",
    label: "Brukere",
    icon: Users,
    section: "admin",
    end: true,
    requiredAnyCapability: [Kapabiliteter.brukere.admin, Kapabiliteter.brukere.lese],
  },
  {
    id: "courts-and-activities",
    to: "admin/baner",
    label: "Baner og grener",
    icon: Shapes,
    section: "admin",
    end: true,
    activePaths: ["admin/baner", "admin/grener"],
    requiredAnyCapability: [Kapabiliteter.baner.admin, Kapabiliteter.grener.admin],
  },
  {
    id: "announcements",
    to: "admin/kunngjøringer",
    label: "Kunngjøringer",
    icon: Megaphone,
    section: "admin",
    end: true,
    requiredAnyCapability: [Kapabiliteter.kunngjøring.admin],
  },
  {
    id: "events-admin",
    to: "arrangement",
    label: "Administrer arrangementer",
    icon: CalendarCog,
    section: "admin",
    end: true,
    requiredAnyCapability: [Kapabiliteter.arrangement.se],
  },
  {
    id: "settings",
    to: "admin/klubb",
    label: "Klubbinnstillinger",
    icon: Settings,
    section: "admin",
    end: true,
    requiredAnyCapability: [Kapabiliteter.klubb.admin],
  },
];

const sectionLabels: Record<NavigationSectionId, string> = {
  overview: "Hovedmeny",
  personal: "Min konto",
  admin: "Administrasjon",
};

function isVisible(item: AppNavigationItem, authenticated: boolean, capabilities: string[]) {
  if (item.requiresAuth && !authenticated) return false;
  if (!item.requiredAnyCapability) return true;
  return item.requiredAnyCapability.some((capability) => harHandling(capabilities, capability));
}

export function buildNavigationSections(
  authenticated: boolean,
  capabilities: string[]
): AppNavigationSection[] {
  return (["overview", "personal", "admin"] as const)
    .map((id) => ({
      id,
      label: sectionLabels[id],
      items: navigationItems.filter(
        (item) => item.section === id && isVisible(item, authenticated, capabilities)
      ),
    }))
    .filter((section) => section.items.length > 0);
}

export function buildMobilePrimaryNavigation(authenticated: boolean, capabilities: string[]) {
  return navigationItems
    .filter(
      (item) =>
        item.mobilePrimaryOrder !== undefined && isVisible(item, authenticated, capabilities)
    )
    .sort((a, b) => (a.mobilePrimaryOrder ?? 0) - (b.mobilePrimaryOrder ?? 0));
}

export function buildMobileSecondaryNavigation(
  authenticated: boolean,
  capabilities: string[]
): AppNavigationSection[] {
  const primaryItemIds = new Set(
    buildMobilePrimaryNavigation(authenticated, capabilities).map((item) => item.id)
  );

  return buildNavigationSections(authenticated, capabilities)
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !primaryItemIds.has(item.id)),
    }))
    .filter((section) => section.items.length > 0);
}

export function isNavigationItemCurrent(item: AppNavigationItem, pathname: string) {
  if (!item.activePaths) return false;

  const normalizedPathname = pathname.replace(/\/+$/, "");

  return item.activePaths.some((path) => {
    const normalizedPath = path.replace(/^\/+|\/+$/g, "");
    const pathSuffix = `/${normalizedPath}`;

    return normalizedPathname.endsWith(pathSuffix) || normalizedPathname.includes(`${pathSuffix}/`);
  });
}
