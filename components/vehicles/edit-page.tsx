"use client";

import { useParams } from "next/navigation";

import { usePermissions } from "@/hooks/use-permissions";
import { useVehicle } from "@/hooks/use-vehicles";
import { VehicleForm } from "@/components/vehicles/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VehicleEditPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("vehicles");
  const vehicleQuery = useVehicle(params.id);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `update` para editar veículos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (vehicleQuery.isLoading) {
    return <Skeleton className="h-[720px] w-full" />;
  }

  if (vehicleQuery.isError || !vehicleQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar veículo</CardTitle>
          <CardDescription>
            Os dados do veículo não estão disponíveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <VehicleForm mode="edit" vehicle={vehicleQuery.data.data} />;
}
