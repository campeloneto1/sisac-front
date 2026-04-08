"use client";

import { AlertTriangle } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { VehicleDamageForm } from "@/components/vehicle-damages/form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function VehicleDamageCreatePage() {
  const permissions = usePermissions("vehicle-damages");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `create` para cadastrar danos de
            veículos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">Novo dano</h1>
          <p className="text-sm text-slate-500">
            Registre o dano detectado e o contexto operacional relacionado.
          </p>
        </div>
      </div>

      <VehicleDamageForm mode="create" />
    </div>
  );
}
