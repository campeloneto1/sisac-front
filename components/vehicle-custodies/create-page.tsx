"use client";

import { CarFront } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { VehicleCustodyForm } from "@/components/vehicle-custodies/form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function VehicleCustodyCreatePage() {
  const permissions = usePermissions("vehicle-custodies");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `create` para cadastrar cautelas de
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
          <CarFront className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            Nova cautela de veiculo
          </h1>
          <p className="text-sm text-slate-500">
            Registre a entrega de um veiculo para responsavel interno ou
            externo.
          </p>
        </div>
      </div>

      <VehicleCustodyForm mode="create" />
    </div>
  );
}
