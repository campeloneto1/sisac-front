"use client";

import { Shield } from "lucide-react";

import { ArmamentSizeForm } from "@/components/armament-sizes/form";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ArmamentSizeCreatePage() {
  const permissions = usePermissions("armament-sizes");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `create` para cadastrar tamanhos de
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
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            Novo tamanho de armamento
          </h1>
          <p className="text-sm text-slate-500">
            Cadastre um novo tamanho administrativo para uso no módulo de
            armamentos.
          </p>
        </div>
      </div>

      <ArmamentSizeForm mode="create" />
    </div>
  );
}
