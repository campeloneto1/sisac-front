"use client";

import Link from "next/link";
import { BarChart3, FolderKanban, LayoutDashboard, Settings2, Shield, Users, Workflow } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";
import { hasAllPermissions, hasPermission, type PermissionRequirement } from "@/lib/permissions";

const generalItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, visible: true },
  { href: "/users", label: "Usuarios", icon: Users, visible: false, permissionResource: "users" },
  { href: "/profile", label: "Perfil", icon: Shield, visible: true },
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

function SidebarSection({
  title,
  items,
}: {
  title?: string;
  items: Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string }> }>;
}) {
  return (
    <div className="space-y-2">
      {title ? <p className="px-4 text-xs uppercase tracking-[0.22em] text-slate-500">{title}</p> : null}
      {items.map((item) => (
        <Link
          key={`${title ?? "general"}-${item.label}`}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-200 transition",
            "hover:bg-white/10 hover:text-white",
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );
}

export function AppSidebar() {
  const { user } = useAuth();
  const userPermissions = usePermissions("users");
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

  return (
    <aside className="hidden w-[228px] shrink-0 rounded-[24px] border border-white/60 bg-slate-950 px-3 py-4 text-white shadow-spotlight lg:flex lg:flex-col">
      <div className="border-b border-white/10 px-2 pb-4">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">SISAC</p>
        <h2 className="mt-2 font-display text-xl">Painel</h2>
      </div>

      <nav className="mt-4 space-y-4">
        <SidebarSection items={visibleGeneralItems} />
        {canSeeAdministratorMenu && visibleAdministratorItems.length ? (
          <SidebarSection title="Administrador" items={visibleAdministratorItems} />
        ) : null}
        {canSeeManagerMenu ? <SidebarSection title="Gestor" items={managerItems} /> : null}
        {canSeeReportsMenu ? <SidebarSection title="Relatorios" items={visibleReportsItems} /> : null}
      </nav>

      <div className="mt-auto rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
        <p className="text-xs text-slate-300">Estrutura pronta para receber os modulos da operacao.</p>
      </div>
    </aside>
  );
}
