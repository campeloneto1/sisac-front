"use client";

import { BriefcaseBusiness } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { VehicleRentalForm } from "@/components/vehicle-rentals/form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function VehicleRentalCreatePage() {
  const permissions = usePermissions("vehicle-rentals");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `create` para cadastrar locacoes de
            veiculos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
          <BriefcaseBusiness className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            Nova locacao de veiculo
          </h1>
          <p className="text-sm text-slate-500">
            Registre o contrato, os custos e o ciclo operacional do veiculo
            alugado.
          </p>
        </div>
      </div>

      <VehicleRentalForm mode="create" />
    </div>
  );
}
