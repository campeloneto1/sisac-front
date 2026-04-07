"use client";

import { useParams } from "next/navigation";
import { CarFront } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useVehicleLoan } from "@/hooks/use-vehicle-loans";
import { VehicleLoanForm } from "@/components/vehicle-loans/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VehicleLoanEditPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("vehicle-loans");
  const loanQuery = useVehicleLoan(params.id);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `update` para editar emprestimos de
            veiculos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loanQuery.isLoading) {
    return <Skeleton className="h-[760px] w-full" />;
  }

  if (loanQuery.isError || !loanQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar emprestimo</CardTitle>
          <CardDescription>
            Os dados do emprestimo nao estao disponiveis para edicao no
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
          <CarFront className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            Editar emprestimo
          </h1>
          <p className="text-sm text-slate-500">
            Atualize o tomador, observacoes e os dados de saida ou devolucao.
          </p>
        </div>
      </div>

      <VehicleLoanForm mode="edit" loan={loanQuery.data.data} />
    </div>
  );
}
