"use client";

import { useParams } from "next/navigation";
import { ShieldPlus } from "lucide-react";

import { useArmamentType } from "@/hooks/use-armament-types";
import { usePermissions } from "@/hooks/use-permissions";
import { ArmamentTypeForm } from "@/components/armament-types/form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ArmamentTypeEditPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("armament-types");
  const armamentTypeQuery = useArmamentType(params.id);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `update` para editar tipos de armamento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (armamentTypeQuery.isLoading) {
    return <Skeleton className="h-[520px] w-full" />;
  }

  if (armamentTypeQuery.isError || !armamentTypeQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar tipo de armamento</CardTitle>
          <CardDescription>
            Os dados do tipo nao estao disponiveis para edicao no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
          <ShieldPlus className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            Editar tipo de armamento
          </h1>
          <p className="text-sm text-slate-500">
            Atualize nome, slug e descricao do tipo cadastrado.
          </p>
        </div>
      </div>

      <ArmamentTypeForm
        mode="edit"
        armamentType={armamentTypeQuery.data.data}
      />
    </div>
  );
}
