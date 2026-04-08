"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { useVehicleType } from "@/hooks/use-vehicle-types";
import { VehicleTypeForm } from "@/components/vehicle-types/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VehicleTypeEditPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("vehicle-types");
  const vehicleTypeQuery = useVehicleType(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa de `administrator` e `vehicle-types.update` para editar
            tipos de veículo.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (vehicleTypeQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (vehicleTypeQuery.isError || !vehicleTypeQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar tipo de veículo</CardTitle>
          <CardDescription>
            O tipo de veículo não pode ser editado agora.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <VehicleTypeForm
      mode="edit"
      vehicleType={vehicleTypeQuery.data.data}
    />
  );
}
