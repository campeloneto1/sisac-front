"use client";

import Link from "next/link";
import { Search } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { SubunitSwitcher } from "@/components/layout/subunit-switcher";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200/70 px-3 py-3 md:px-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Area autenticada</p>
          <h1 className="font-display text-xl text-slate-900">Dashboard inicial</h1>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative min-w-[220px] xl:min-w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="h-10 pl-9" placeholder="Buscar módulos, pessoas ou processos" />
          </div>

          <SubunitSwitcher />

          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 rounded-xl px-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user?.avatarFallback ?? "US"}</AvatarFallback>
                </Avatar>
                <span className="ml-3 hidden text-left sm:block">
                  <span className="block text-sm font-medium leading-none">{user?.name ?? "Usuário"}</span>
                  <span className="mt-1 block text-xs text-slate-500">{user?.role?.name ?? "Perfil"}</span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{user?.email}</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile">Perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
