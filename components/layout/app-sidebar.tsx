"use client";

import Link from "next/link";
import { FolderKanban, LayoutDashboard, Shield, Users, Workflow } from "lucide-react";

import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, visible: true },
  { href: "/users", label: "Usuarios", icon: Users, visible: false, permissionResource: "users" },
  { href: "/profile", label: "Perfil", icon: Shield, visible: true },
  { href: "#", label: "Fluxos", icon: Workflow, visible: true },
  { href: "#", label: "Projetos", icon: FolderKanban, visible: true },
];

export function AppSidebar() {
  const userPermissions = usePermissions("users");

  return (
    <aside className="hidden w-[280px] shrink-0 rounded-[28px] border border-white/60 bg-slate-950 p-4 text-white shadow-spotlight lg:flex lg:flex-col">
      <div className="rounded-[24px] bg-white/5 p-5">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">SISAC</p>
        <h2 className="mt-3 font-display text-2xl">Base App</h2>
        <p className="mt-2 text-sm text-slate-300">
          Casca inicial pronta para areas autenticadas, CRUDs e controle de contexto.
        </p>
      </div>

      <nav className="mt-6 space-y-2">
        {items.map((item) => {
          const visible = item.permissionResource === "users" ? userPermissions.canViewAny : item.visible;

          if (!visible) {
            return null;
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-200 transition",
                "hover:bg-white/10 hover:text-white",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[24px] border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-slate-200">Pronto para receber os modulos da operacao.</p>
      </div>
    </aside>
  );
}
