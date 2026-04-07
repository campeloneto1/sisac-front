"use client";

import { ShieldPlus } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { ArmamentTypeForm } from "@/components/armament-types/form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ArmamentTypeCreatePage() {
  const permissions = usePermissions("armament-types");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `create` para cadastrar tipos de
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
          <ShieldPlus className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            Novo tipo de armamento
          </h1>
          <p className="text-sm text-slate-500">
            Cadastre um novo tipo para classificacao administrativa.
          </p>
        </div>
      </div>

      <ArmamentTypeForm mode="create" />
    </div>
  );
}
