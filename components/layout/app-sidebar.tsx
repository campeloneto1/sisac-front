"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Award,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Landmark,
  Building2,
  CarFront,
  ChevronDown,
  FileHeart,
  Palmtree,
  Globe2,
  GraduationCap,
  LayoutDashboard,
  Map,
  MapPinned,
  Medal,
  Network,
  Orbit,
  Settings2,
  Shield,
  Shapes,
  Spline,
  Users,
  Workflow,
} from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";
import {
  can,
  hasAllPermissions,
  hasPermission,
  type PermissionRequirement,
} from "@/lib/permissions";

const generalItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    visible: true,
  },
  {
    href: "/users",
    label: "Usuarios",
    icon: Users,
    visible: false,
    permissionResource: "users",
  },
  {
    href: "/police-officers",
    label: "Policiais",
    icon: Shield,
    visible: false,
    permissionResource: "police-officers",
  },
  {
    href: "/police-officer-ranks",
    label: "Promoções",
    icon: Medal,
    visible: false,
    permissionResource: "police-officer-ranks",
  },
  {
    href: "/police-officer-leaves",
    label: "Afastamentos",
    icon: FileHeart,
    visible: false,
    permissionResource: "police-officer-leaves",
  },
  {
    href: "/police-officer-vacations",
    label: "Ferias",
    icon: Palmtree,
    visible: false,
    permissionResource: "police-officer-vacations",
  },
  {
    href: "/courses",
    label: "Cursos",
    icon: BookOpen,
    visible: false,
    permissionResource: "courses",
  },
  {
    href: "/course-classes",
    label: "Turmas",
    icon: GraduationCap,
    visible: false,
    permissionResource: "course-classes",
  },
];

const administratorItems: Array<{
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requirements: PermissionRequirement[];
}> = [
  {
    href: "/roles",
    label: "Perfis",
    icon: Settings2,
    requirements: [{ type: "resource", resource: "roles", action: "viewAny" }],
  },
  {
    href: "/brands",
    label: "Marcas",
    icon: CarFront,
    requirements: [{ type: "resource", resource: "brands", action: "viewAny" }],
  },
  {
    href: "/variants",
    label: "Modelos",
    icon: Shapes,
    requirements: [
      { type: "resource", resource: "variants", action: "viewAny" },
    ],
  },
  {
    href: "/countries",
    label: "Paises",
    icon: Globe2,
    requirements: [
      { type: "resource", resource: "countries", action: "viewAny" },
    ],
  },
  {
    href: "/states",
    label: "Estados",
    icon: Map,
    requirements: [{ type: "resource", resource: "states", action: "viewAny" }],
  },
  {
    href: "/cities",
    label: "Cidades",
    icon: MapPinned,
    requirements: [{ type: "resource", resource: "cities", action: "viewAny" }],
  },
  {
    href: "/units",
    label: "Unidades",
    icon: Building2,
    requirements: [{ type: "resource", resource: "units", action: "viewAny" }],
  },
  {
    href: "/subunits",
    label: "Subunidades",
    icon: Network,
    requirements: [
      { type: "resource", resource: "subunits", action: "viewAny" },
    ],
  },
  {
    href: "/banks",
    label: "Bancos",
    icon: Landmark,
    requirements: [{ type: "resource", resource: "banks", action: "viewAny" }],
  },
  {
    href: "/genders",
    label: "Generos",
    icon: Orbit,
    requirements: [
      { type: "resource", resource: "genders", action: "viewAny" },
    ],
  },
  {
    href: "/education-levels",
    label: "Escolaridade",
    icon: GraduationCap,
    requirements: [
      { type: "resource", resource: "education-levels", action: "viewAny" },
    ],
  },
  {
    href: "/ranks",
    label: "Postos/graduações",
    icon: Award,
    requirements: [{ type: "resource", resource: "ranks", action: "viewAny" }],
  },
  {
    href: "/leave-types",
    label: "Tipos de afastamento",
    icon: BriefcaseBusiness,
    requirements: [
      { type: "resource", resource: "leave-types", action: "viewAny" },
    ],
  },
  {
    href: "/sectors",
    label: "Setores",
    icon: Spline,
    requirements: [
      { type: "resource", resource: "sectors", action: "viewAny" },
    ],
  },
  {
    href: "/permissions",
    label: "Permissoes",
    icon: Shield,
    requirements: [
      { type: "resource", resource: "permissions", action: "viewAny" },
    ],
  },
  {
    href: "/publication-types",
    label: "Tipos de publicacao",
    icon: FileHeart,
    requirements: [
      { type: "resource", resource: "publication-types", action: "viewAny" },
    ],
  },
];

const managerItems: Array<{
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requirements: PermissionRequirement[];
}> = [
  {
    href: "/companies",
    label: "Empresas",
    icon: Building2,
    requirements: [
      { type: "resource", resource: "companies", action: "viewAny" },
    ],
  },
  {
    href: "/assignments",
    label: "Funções",
    icon: Workflow,
    requirements: [
      { type: "resource", resource: "assignments", action: "viewAny" },
    ],
  },
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

function SidebarLink({
  item,
  pathname,
  nested = false,
}: {
  item: SidebarItem;
  pathname: string;
  nested?: boolean;
}) {
  const isActive = isItemActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
        nested ? "ml-2 text-slate-300" : "text-slate-200",
        isActive
          ? "bg-white text-slate-950 shadow-sm"
          : "hover:bg-white/10 hover:text-white",
      )}
    >
      <item.icon className="h-4 w-4" />
      <span>{item.label}</span>
    </Link>
  );
}

function SidebarSection({
  items,
  pathname,
}: {
  items: SidebarItem[];
  pathname: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <SidebarLink
          key={`general-${item.label}`}
          item={item}
          pathname={pathname}
        />
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
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            isOpen ? "rotate-180" : "rotate-0",
          )}
        />
      </button>

      {isOpen ? (
        <div className="space-y-2 border-l border-white/10 pl-2">
          {items.map((item) => (
            <SidebarLink
              key={`${title}-${item.label}`}
              item={item}
              pathname={pathname}
              nested
            />
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
    .filter((item) => {
      if (!item.permissionResource) {
        return item.visible;
      }

      if (item.permissionResource === "users") {
        return userPermissions.canViewAny;
      }

      if (item.permissionResource === "police-officers") {
        return can(user, "viewAny", "police-officers");
      }

      if (item.permissionResource === "police-officer-ranks") {
        return can(user, "viewAny", "police-officer-ranks");
      }

      if (item.permissionResource === "police-officer-leaves") {
        return can(user, "viewAny", "police-officer-leaves");
      }

      if (item.permissionResource === "police-officer-vacations") {
        return can(user, "viewAny", "police-officer-vacations");
      }

      if (item.permissionResource === "courses") {
        return can(user, "viewAny", "courses");
      }

      if (item.permissionResource === "course-classes") {
        return can(user, "viewAny", "course-classes");
      }

      return item.visible;
    })
    .map(({ href, label, icon }) => ({ href, label, icon }));
  const visibleReportsItems = reportsItems
    .filter((item) => hasAllPermissions(user, item.requirements))
    .map(({ href, label, icon }) => ({ href, label, icon }));
  const visibleAdministratorItems = administratorItems
    .filter((item) => hasAllPermissions(user, item.requirements))
    .map(({ href, label, icon }) => ({ href, label, icon }));
  const sections = [
    {
      key: "Administrador",
      visible: canSeeAdministratorMenu && visibleAdministratorItems.length > 0,
      items: visibleAdministratorItems,
    },
    {
      key: "Gestor",
      visible: canSeeManagerMenu && managerItems.length > 0,
      items: managerItems,
    },
    {
      key: "Relatorios",
      visible: canSeeReportsMenu && visibleReportsItems.length > 0,
      items: visibleReportsItems,
    },
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
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
          SISAC
        </p>
        <h2 className="mt-2 font-display text-xl">Painel</h2>
      </div>

      <nav className="mt-4 space-y-4">
        <SidebarSection items={visibleGeneralItems} pathname={pathname} />
        {sections
          .filter((section) => section.visible)
          .map((section) => {
            const hasActiveChild = section.items.some((item) =>
              isItemActive(pathname, item.href),
            );
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
        <p className="text-xs text-slate-300">
          Estrutura pronta para receber os modulos da operacao.
        </p>
      </div>
    </aside>
  );
}
