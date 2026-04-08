"use client";

import { Crosshair } from "lucide-react";

import { ArmamentCaliberForm } from "@/components/armament-calibers/form";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ArmamentCaliberCreatePage() {
  const permissions = usePermissions("armament-calibers");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `create` para cadastrar calibres de
            armamento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
          <Crosshair className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            Novo calibre de armamento
          </h1>
          <p className="text-sm text-slate-500">
            Cadastre um novo calibre administrativo para uso no módulo de
            armamentos.
          </p>
        </div>
      </div>

      <ArmamentCaliberForm mode="create" />
    </div>
  );
}
