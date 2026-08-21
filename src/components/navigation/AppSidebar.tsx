import { CalendarCheck, CircleUser, LogIn, LogOut } from "lucide-react";
import { Link, useLocation, useMatch, useResolvedPath } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useBruker } from "@/hooks/useBruker";
import { useKlubb } from "@/hooks/useKlubb";
import { formaterRoller } from "@/utils/brukerPresentation";
import { routePrefetchProps } from "@/utils/prefetchRoute";

import NavbarBrandMedKlubb from "./NavbarBrandMedKlubb";
import ModeToggle from "./ModeToggle";
import {
  buildNavigationSections,
  isNavigationItemCurrent,
  type AppNavigationItem,
  type AppNavigationSection,
} from "./navigationModel";

function SidebarNavigationItem({ item }: { item: AppNavigationItem }) {
  const location = useLocation();
  const resolved = useResolvedPath(item.to);
  const routeMatch = useMatch({ path: resolved.pathname, end: item.end ?? false });
  const isActive = item.activePaths
    ? isNavigationItemCurrent(item, location.pathname)
    : Boolean(routeMatch);
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
        <Link to={item.to} aria-label={item.label} {...routePrefetchProps(item.to)}>
          <Icon aria-hidden="true" />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarSection({ section }: { section: AppNavigationSection }) {
  return (
    <SidebarGroup>
      {section.id === "overview" ? null : <SidebarGroupLabel>{section.label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {section.items.map((item) => (
            <SidebarNavigationItem key={item.id} item={item} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function SidebarAccount() {
  const { currentUser, signOut } = useAuth();
  const { bruker } = useBruker();

  if (!currentUser) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Logg inn">
            <Link to="login" {...routePrefetchProps("login")}>
              <LogIn aria-hidden="true" />
              <span>Logg inn</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const accountLabel = currentUser.name || currentUser.email || "Din konto";
  const roleLabel = formaterRoller(bruker?.roller, "Innlogget");

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" tooltip={accountLabel}>
              <span data-ui="sidebar-account-avatar">
                <CircleUser aria-hidden="true" />
              </span>
              <span data-ui="sidebar-account-summary">
                <span data-part="label">{accountLabel}</span>
                <span data-part="meta">{roleLabel}</span>
              </span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" data-ui="sidebar-account-menu">
            <DropdownMenuLabel>
              <span data-ui="sidebar-account-details">
                <span data-part="label">{accountLabel}</span>
                {currentUser.email ? <span data-part="meta">{currentUser.email}</span> : null}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="bookinger" {...routePrefetchProps("bookinger")}>
                <CalendarCheck aria-hidden="true" />
                Mine tider
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="minside" {...routePrefetchProps("minside")}>
                <CircleUser aria-hidden="true" />
                Min side
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => void signOut()}>
              <LogOut aria-hidden="true" />
              Logg ut
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export default function AppSidebar() {
  const { data: klubb } = useKlubb();
  const { currentUser } = useAuth();
  const { bruker } = useBruker();
  const sections = buildNavigationSections(Boolean(currentUser), bruker?.kapabiliteter ?? []);

  return (
    <Sidebar className="app-sidebar-fixed" variant="inset" collapsible="none">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip={klubb?.navn ?? "Banebooking"}>
              <NavbarBrandMedKlubb
                klubbnavn={klubb?.navn ?? "Banebooking"}
                tone="inverted"
                placement="sidebar"
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {sections.map((section) => (
          <SidebarSection key={section.id} section={section} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <ModeToggle presentation="sidebar" />
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarAccount />
      </SidebarFooter>
    </Sidebar>
  );
}
