"use client";

import { useParams } from "next/navigation";
import { CarFront } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useVehicleCustody } from "@/hooks/use-vehicle-custodies";
import { VehicleCustodyForm } from "@/components/vehicle-custodies/form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VehicleCustodyEditPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("vehicle-custodies");
  const custodyQuery = useVehicleCustody(params.id);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `update` para editar cautelas de
            veículos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (custodyQuery.isLoading) {
    return <Skeleton className="h-[760px] w-full" />;
  }

  if (custodyQuery.isError || !custodyQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar cautela</CardTitle>
          <CardDescription>
            Os dados da cautela não estão disponíveis para edição no momento.
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
            Editar cautela
          </h1>
          <p className="text-sm text-slate-500">
            Atualize o responsável, observações e os dados operacionais da
            cautela.
          </p>
        </div>
      </div>

      <VehicleCustodyForm mode="edit" custody={custodyQuery.data.data} />
    </div>
  );
}
