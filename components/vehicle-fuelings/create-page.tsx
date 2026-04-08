"use client";

import { Fuel } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { VehicleFuelingForm } from "@/components/vehicle-fuelings/form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function VehicleFuelingCreatePage() {
  const permissions = usePermissions("vehicle-fuelings");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `create` para cadastrar abastecimentos de
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
          <Fuel className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            Novo abastecimento
          </h1>
          <p className="text-sm text-slate-500">
            Registre o abastecimento do veículo dentro do contexto operacional
            correspondente.
          </p>
        </div>
      </div>

      <VehicleFuelingForm mode="create" />
    </div>
  );
}
