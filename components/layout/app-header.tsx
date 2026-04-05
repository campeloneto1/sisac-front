"use client";

import { Bell, Search } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { SubunitSwitcher } from "@/components/layout/subunit-switcher";
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
    <header className="border-b border-slate-200/70 px-4 py-4 md:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Area autenticada</p>
          <h1 className="font-display text-2xl text-slate-900">Dashboard inicial</h1>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" placeholder="Buscar modulos, pessoas ou processos" />
          </div>

          <SubunitSwitcher />

          <Button size="icon" variant="outline" className="rounded-2xl">
            <Bell className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 rounded-2xl px-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user?.avatarFallback ?? "US"}</AvatarFallback>
                </Avatar>
                <span className="ml-3 hidden text-left sm:block">
                  <span className="block text-sm font-medium leading-none">{user?.name ?? "Usuario"}</span>
                  <span className="mt-1 block text-xs text-slate-500">{user?.role ?? "Perfil"}</span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{user?.email}</DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

