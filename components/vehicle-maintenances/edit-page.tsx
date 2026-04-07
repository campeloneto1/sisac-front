"use client";

import { useParams } from "next/navigation";
import { Wrench } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useVehicleMaintenance } from "@/hooks/use-vehicle-maintenances";
import { VehicleMaintenanceForm } from "@/components/vehicle-maintenances/form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VehicleMaintenanceEditPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("vehicle-maintenances");
  const maintenanceQuery = useVehicleMaintenance(params.id);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `update` para editar manutencoes de
            veiculos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (maintenanceQuery.isLoading) {
    return <Skeleton className="h-[820px] w-full" />;
  }

  if (maintenanceQuery.isError || !maintenanceQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar manutencao</CardTitle>
          <CardDescription>
            Os dados da manutencao nao estao disponiveis para edicao no
            momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
          <Wrench className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            Editar manutencao
          </h1>
          <p className="text-sm text-slate-500">
            Atualize oficina, custos, datas de saida e status da manutencao.
          </p>
        </div>
      </div>

      <VehicleMaintenanceForm
        mode="edit"
        maintenance={maintenanceQuery.data.data}
      />
    </div>
  );
}
