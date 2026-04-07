"use client";

import { useParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useVehicleDamage } from "@/hooks/use-vehicle-damages";
import { VehicleDamageForm } from "@/components/vehicle-damages/form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VehicleDamageEditPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("vehicle-damages");
  const damageQuery = useVehicleDamage(params.id);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `update` para editar danos de veiculos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (damageQuery.isLoading) {
    return <Skeleton className="h-[960px] w-full" />;
  }

  if (damageQuery.isError || !damageQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar dano</CardTitle>
          <CardDescription>
            Os dados do dano nao estao disponiveis para edicao no momento.
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
          <h1 className="font-display text-3xl text-slate-900">Editar dano</h1>
          <p className="text-sm text-slate-500">
            Atualize gravidade, custos, reparo e informacoes do dano.
          </p>
        </div>
      </div>

      <VehicleDamageForm mode="edit" damage={damageQuery.data.data} />
    </div>
  );
}
