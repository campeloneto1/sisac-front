"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { BarChart3, CarFront, ChevronDown, FolderKanban, Globe2, LayoutDashboard, Settings2, Shield, Shapes, Users, Workflow } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";
import { hasAllPermissions, hasPermission, type PermissionRequirement } from "@/lib/permissions";

const generalItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, visible: true },
  { href: "/users", label: "Usuarios", icon: Users, visible: false, permissionResource: "users" },
  { href: "#", label: "Fluxos", icon: Workflow, visible: true },
  { href: "#", label: "Projetos", icon: FolderKanban, visible: true },
];

const administratorItems: Array<{
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requirements: PermissionRequirement[];
}> = [
  { href: "/roles", label: "Perfis", icon: Settings2, requirements: [{ type: "resource", resource: "roles", action: "viewAny" }] },
  { href: "/brands", label: "Marcas", icon: CarFront, requirements: [{ type: "resource", resource: "brands", action: "viewAny" }] },
  { href: "/variants", label: "Variantes", icon: Shapes, requirements: [{ type: "resource", resource: "variants", action: "viewAny" }] },
  { href: "/countries", label: "Paises", icon: Globe2, requirements: [{ type: "resource", resource: "countries", action: "viewAny" }] },
  {
    href: "/permissions",
    label: "Permissoes",
    icon: Shield,
    requirements: [{ type: "resource", resource: "permissions", action: "viewAny" }],
  },
];

const managerItems = [
  { href: "#", label: "Painel gestor", icon: Settings2 },
];

const reportsItems: Array<{
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requirements: PermissionRequirement[];
}> = [
  {
    href: "#",
    label: "Relatorios gerais",
    icon: BarChart3,
    requirements: [{ type: "slug", value: "reports" }],
  },
  ];

type SidebarItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

function isItemActive(pathname: string, href: string) {
  if (href === "#") {
    return false;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarLink({ item, pathname, nested = false }: { item: SidebarItem; pathname: string; nested?: boolean }) {
  const isActive = isItemActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
        nested ? "ml-2 text-slate-300" : "text-slate-200",
        isActive ? "bg-white text-slate-950 shadow-sm" : "hover:bg-white/10 hover:text-white",
      )}
    >
      <item.icon className="h-4 w-4" />
      <span>{item.label}</span>
    </Link>
  );
}

function SidebarSection({ items, pathname }: { items: SidebarItem[]; pathname: string }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <SidebarLink key={`general-${item.label}`} item={item} pathname={pathname} />
      ))}
    </div>
  );
}

function SidebarAccordionSection({
  title,
  items,
  pathname,
  isOpen,
  onToggle,
}: {
  title: string;
  items: SidebarItem[];
  pathname: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs uppercase tracking-[0.22em] text-slate-400 transition hover:bg-white/5 hover:text-white"
      >
        <span>{title}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen ? "rotate-180" : "rotate-0")} />
      </button>

      {isOpen ? (
        <div className="space-y-2 border-l border-white/10 pl-2">
          {items.map((item) => (
            <SidebarLink key={`${title}-${item.label}`} item={item} pathname={pathname} nested />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AppSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const userPermissions = usePermissions("users");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const canSeeAdministratorMenu = hasPermission(user, "administrator");
  const canSeeManagerMenu = hasPermission(user, "manager");
  const canSeeReportsMenu = hasPermission(user, "reports");
  const visibleGeneralItems = generalItems
    .filter((item) => (item.permissionResource === "users" ? userPermissions.canViewAny : item.visible))
    .map(({ href, label, icon }) => ({ href, label, icon }));
  const visibleReportsItems = reportsItems
    .filter((item) => hasAllPermissions(user, item.requirements))
    .map(({ href, label, icon }) => ({ href, label, icon }));
  const visibleAdministratorItems = administratorItems
    .filter((item) => hasAllPermissions(user, item.requirements))
    .map(({ href, label, icon }) => ({ href, label, icon }));
  const sections = [
    { key: "Administrador", visible: canSeeAdministratorMenu && visibleAdministratorItems.length > 0, items: visibleAdministratorItems },
    { key: "Gestor", visible: canSeeManagerMenu && managerItems.length > 0, items: managerItems },
    { key: "Relatorios", visible: canSeeReportsMenu && visibleReportsItems.length > 0, items: visibleReportsItems },
  ];

  function toggleSection(key: string) {
    setOpenSections((current) => ({
      ...current,
      [key]: !(current[key] ?? false),
    }));
  }

  return (
    <aside className="hidden w-[228px] shrink-0 rounded-[24px] border border-white/60 bg-slate-950 px-3 py-4 text-white shadow-spotlight lg:flex lg:flex-col">
      <div className="border-b border-white/10 px-2 pb-4">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">SISAC</p>
        <h2 className="mt-2 font-display text-xl">Painel</h2>
      </div>

      <nav className="mt-4 space-y-4">
        <SidebarSection items={visibleGeneralItems} pathname={pathname} />
        {sections
          .filter((section) => section.visible)
          .map((section) => {
            const hasActiveChild = section.items.some((item) => isItemActive(pathname, item.href));
            const isOpen = openSections[section.key] ?? hasActiveChild;

            return (
              <SidebarAccordionSection
                key={section.key}
                title={section.key}
                items={section.items}
                pathname={pathname}
                isOpen={isOpen}
                onToggle={() => toggleSection(section.key)}
              />
            );
          })}
      </nav>

      <div className="mt-auto rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
        <p className="text-xs text-slate-300">Estrutura pronta para receber os modulos da operacao.</p>
      </div>
    </aside>
  );
}
