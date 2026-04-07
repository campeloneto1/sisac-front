"use client";

import { useParams } from "next/navigation";
import { Crosshair } from "lucide-react";

import { useArmamentCaliber } from "@/hooks/use-armament-calibers";
import { usePermissions } from "@/hooks/use-permissions";
import { ArmamentCaliberForm } from "@/components/armament-calibers/form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ArmamentCaliberEditPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("armament-calibers");
  const armamentCaliberQuery = useArmamentCaliber(params.id);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `update` para editar calibres de
            armamento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (armamentCaliberQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (armamentCaliberQuery.isError || !armamentCaliberQuery.data?.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Nao foi possivel carregar o calibre</CardTitle>
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
          <Crosshair className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            Editar calibre de armamento
          </h1>
          <p className="text-sm text-slate-500">
            Atualize as informacoes do calibre{" "}
            {armamentCaliberQuery.data.data.name}.
          </p>
        </div>
      </div>

      <ArmamentCaliberForm
        mode="edit"
        armamentCaliber={armamentCaliberQuery.data.data}
      />
    </div>
  );
}
