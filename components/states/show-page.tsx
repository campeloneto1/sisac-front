"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Globe2, MapPinned, UserCircle2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useStateItem } from "@/hooks/use-states";
import { hasPermission } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StateShowPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("states");
  const stateQuery = useStateItem(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `states.view` para visualizar estados.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (stateQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (stateQuery.isError || !stateQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar estado</CardTitle>
          <CardDescription>Os dados do estado nao estao disponiveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const stateItem = stateQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">{stateItem.name}</h1>
            <Badge variant="outline">{stateItem.abbreviation}</Badge>
          </div>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Estado cadastrado no modulo administrativo para uso em enderecos e estruturas territoriais.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/states/${stateItem.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Visao geral</CardTitle>
            <CardDescription>Indicadores rapidos do estado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <MapPinned className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Sigla</p>
                <p className="text-sm text-slate-700">{stateItem.abbreviation}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Globe2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Pais</p>
                <p className="text-sm text-slate-700">
                  {stateItem.country ? `${stateItem.country.name} (${stateItem.country.abbreviation})` : "Nao informado"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">
                  {stateItem.creator ? `${stateItem.creator.name} (${stateItem.creator.email})` : "Nao informado"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                <p className="text-sm text-slate-700">
                  {stateItem.updater ? `${stateItem.updater.name} (${stateItem.updater.email})` : "Nao informado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Pais vinculado</CardTitle>
            <CardDescription>Contexto carregado pelo `StateResource`.</CardDescription>
          </CardHeader>
          <CardContent>
            {stateItem.country ? (
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                <p className="text-sm font-medium text-slate-900">{stateItem.country.name}</p>
                <p className="mt-1 text-xs text-slate-500">Sigla oficial: {stateItem.country.abbreviation}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Este estado ainda nao possui pais vinculado.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
