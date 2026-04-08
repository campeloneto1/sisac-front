"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SubunitSwitcher } from "@/components/layout/subunit-switcher";
import { NoticeBell } from "@/components/notices/notice-bell";
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
import { Dialog, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";

export function AppHeader() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-slate-200/70 px-3 py-3 md:px-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl lg:hidden"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </Button>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Area autenticada</p>
            <h1 className="font-display text-lg text-slate-900 sm:text-xl">Dashboard inicial</h1>
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative hidden min-w-[220px] md:block xl:min-w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="h-10 pl-9" placeholder="Buscar módulos, pessoas ou processos" />
          </div>

          <div className="min-w-0">
            <SubunitSwitcher />
          </div>

          <div className="flex items-center gap-2">
            <NoticeBell />

            <NotificationBell />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 rounded-xl px-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user?.avatarFallback ?? "US"}</AvatarFallback>
                  </Avatar>
                  <span className="ml-3 hidden text-left sm:block">
                    <span className="block max-w-[140px] truncate text-sm font-medium leading-none">{user?.name ?? "Usuário"}</span>
                    <span className="mt-1 block max-w-[140px] truncate text-xs text-slate-500">{user?.role?.name ?? "Perfil"}</span>
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
      </div>

      <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DialogPortal>
          <DialogOverlay onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[320px] lg:hidden">
            <DialogTitle className="sr-only">Menu de navegação</DialogTitle>
            <div className="relative h-dvh">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3 z-10 h-9 w-9 rounded-full text-white hover:bg-white/10 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Fechar menu</span>
              </Button>
              <AppSidebar
                className="h-dvh w-full rounded-none border-0 border-r border-white/10 shadow-none"
                onNavigate={() => setIsMobileMenuOpen(false)}
              />
            </div>
          </div>
        </DialogPortal>
      </Dialog>
    </header>
  );
}
