"use client";

import { useParams } from "next/navigation";
import { Landmark } from "lucide-react";

import { useSubunit } from "@/contexts/subunit-context";
import { usePatrimony } from "@/hooks/use-patrimonies";
import { usePermissions } from "@/hooks/use-permissions";
import { PatrimonyForm } from "@/components/patrimonies/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PatrimonyEditPage() {
  const params = useParams<{ id: string }>();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("patrimonies");
  const patrimonyQuery = usePatrimony(
    params.id,
    Boolean(activeSubunit) && permissions.canUpdate,
  );

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `update` para editar patrimônios.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>
            O módulo depende da subunidade ativa para carregar o patrimônio.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (patrimonyQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-[42rem] w-full" />
      </div>
    );
  }

  if (patrimonyQuery.isError || !patrimonyQuery.data?.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Não foi possível carregar o patrimônio</CardTitle>
          <CardDescription>
            Verifique se o registro existe e se você possui acesso a ele.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
          <Landmark className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            Editar patrimônio
          </h1>
          <p className="text-sm text-slate-500">
            Atualize os dados cadastrais do bem patrimonial.
          </p>
        </div>
      </div>

      <PatrimonyForm mode="edit" patrimony={patrimonyQuery.data.data} />
    </div>
  );
}
