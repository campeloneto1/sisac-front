"use client";

import { useParams } from "next/navigation";
import { BriefcaseBusiness } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useVehicleRental } from "@/hooks/use-vehicle-rentals";
import { VehicleRentalForm } from "@/components/vehicle-rentals/form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VehicleRentalEditPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("vehicle-rentals");
  const rentalQuery = useVehicleRental(params.id);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `update` para editar locacoes de
            veiculos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (rentalQuery.isLoading) {
    return <Skeleton className="h-[840px] w-full" />;
  }

  if (rentalQuery.isError || !rentalQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar locacao</CardTitle>
          <CardDescription>
            Os dados da locacao nao estao disponiveis para edicao no momento.
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
            Editar locacao
          </h1>
          <p className="text-sm text-slate-500">
            Atualize contrato, custos, quilometragem e status da locacao.
          </p>
        </div>
      </div>

      <VehicleRentalForm mode="edit" rental={rentalQuery.data.data} />
    </div>
  );
}
