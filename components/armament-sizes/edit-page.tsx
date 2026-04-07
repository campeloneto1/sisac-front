"use client";

import { useParams } from "next/navigation";
import { Shield } from "lucide-react";

import { useArmamentSize } from "@/hooks/use-armament-sizes";
import { usePermissions } from "@/hooks/use-permissions";
import { ArmamentSizeForm } from "@/components/armament-sizes/form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ArmamentSizeEditPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("armament-sizes");
  const armamentSizeQuery = useArmamentSize(params.id);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `update` para editar tamanhos de
            armamento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (armamentSizeQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (armamentSizeQuery.isError || !armamentSizeQuery.data?.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Nao foi possivel carregar o tamanho</CardTitle>
          <CardDescription>
            Verifique se o registro existe e se voce possui acesso a ele.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            Editar tamanho de armamento
          </h1>
          <p className="text-sm text-slate-500">
            Atualize as informacoes do tamanho {armamentSizeQuery.data.data.name}
            .
          </p>
        </div>
      </div>

      <ArmamentSizeForm
        mode="edit"
        armamentSize={armamentSizeQuery.data.data}
      />
    </div>
  );
}
