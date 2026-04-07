"use client";

import { useParams } from "next/navigation";
import { Crosshair } from "lucide-react";

import { ArmamentForm } from "@/components/armaments/form";
import { useArmament } from "@/hooks/use-armaments";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ArmamentEditPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("armaments");
  const armamentQuery = useArmament(params.id);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `update` para editar armamentos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (armamentQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-[30rem] w-full" />
      </div>
    );
  }

  if (armamentQuery.isError || !armamentQuery.data?.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Nao foi possivel carregar o armamento</CardTitle>
          <CardDescription>
            Verifique se o registro existe e se voce possui acesso a ele.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const armament = armamentQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
          <Crosshair className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            Editar armamento
          </h1>
          <p className="text-sm text-slate-500">
            Atualize as informacoes do armamento {armament.type?.name}{" "}
            {armament.variant?.name}.
          </p>
        </div>
      </div>

      <ArmamentForm mode="edit" armament={armament} />
    </div>
  );
}
