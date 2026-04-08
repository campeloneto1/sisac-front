"use client";

import { Fuel } from "lucide-react";
import { useParams } from "next/navigation";

import { usePermissions } from "@/hooks/use-permissions";
import { useVehicleFueling } from "@/hooks/use-vehicle-fuelings";
import { VehicleFuelingForm } from "@/components/vehicle-fuelings/form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VehicleFuelingEditPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("vehicle-fuelings");
  const fuelingQuery = useVehicleFueling(params.id);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `update` para editar abastecimentos de
            veículos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (fuelingQuery.isLoading) {
    return <Skeleton className="h-[900px] w-full" />;
  }

  if (fuelingQuery.isError || !fuelingQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar abastecimento</CardTitle>
          <CardDescription>
            Os dados do abastecimento não estão disponíveis para edição no
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
          <Fuel className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            Editar abastecimento
          </h1>
          <p className="text-sm text-slate-500">
            Atualize litros, valores, posto, responsável e contexto
            operacional.
          </p>
        </div>
      </div>

      <VehicleFuelingForm mode="edit" fueling={fuelingQuery.data.data} />
    </div>
  );
}
