"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FileText, ScrollText, UserCircle2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useContractObject } from "@/hooks/use-contract-objects";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ContractObjectShowPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("contract-objects");
  const contractObjectQuery = useContractObject(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `contract-objects.view` para visualizar objetos de contrato.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (contractObjectQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (contractObjectQuery.isError || !contractObjectQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar objeto de contrato</CardTitle>
          <CardDescription>Os dados do objeto de contrato não estão disponíveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const contractObject = contractObjectQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">{contractObject.name}</h1>
            <Badge variant="outline">{contractObject.contracts_count ?? 0} contrato(s)</Badge>
          </div>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Objeto administrativo global utilizado para identificar o assunto central e a finalidade dos contratos.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/contract-objects/${contractObject.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Visao geral</CardTitle>
            <CardDescription>Indicadores rapidos do objeto de contrato.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <FileText className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Contratos vinculados</p>
                <p className="text-sm text-slate-700">{contractObject.contracts_count ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">
                  {contractObject.creator ? `${contractObject.creator.name} (${contractObject.creator.email})` : "Não informado"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                <p className="text-sm text-slate-700">
                  {contractObject.updater ? `${contractObject.updater.name} (${contractObject.updater.email})` : "Não informado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Descrição e uso</CardTitle>
            <CardDescription>Dados retornados pelo `ContractObjectResource`.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-slate-900">Descrição</p>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                {contractObject.description?.trim() || "Sem descrição cadastrada."}
              </p>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3">
              <p className="text-sm text-slate-600">
                Se este objeto já estiver sendo usado em contratos, a exclusão pode ser recusada ou controlada pela API mesmo com `soft delete`.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
