"use client";

import { Crosshair } from "lucide-react";

import { ArmamentForm } from "@/components/armaments/form";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ArmamentCreatePage() {
  const permissions = usePermissions("armaments");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `create` para cadastrar armamentos.
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
            Novo armamento
          </h1>
          <p className="text-sm text-slate-500">
            Cadastre um novo armamento base com sua classificação técnica.
          </p>
        </div>
      </div>

      <ArmamentForm mode="create" />
    </div>
  );
}
