"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ReceiptText, ScrollText, UserCircle2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useContractType } from "@/hooks/use-contract-types";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { getContractBillingModelDescription, getContractBillingModelLabel } from "@/types/contract-type.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ContractTypeShowPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("contract-types");
  const contractTypeQuery = useContractType(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `contract-types.view` para visualizar tipos de contrato.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (contractTypeQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (contractTypeQuery.isError || !contractTypeQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar tipo de contrato</CardTitle>
          <CardDescription>Os dados do tipo de contrato nao estao disponiveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const contractType = contractTypeQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">{contractType.name}</h1>
            <Badge variant="info">{contractType.billing_model_label ?? getContractBillingModelLabel(contractType.billing_model)}</Badge>
          </div>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Tipo administrativo global usado para classificar contratos e indicar como o faturamento e interpretado no sistema.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/contract-types/${contractType.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Visao geral</CardTitle>
            <CardDescription>Indicadores rapidos do tipo de contrato.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <ReceiptText className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Modelo de faturamento</p>
                <p className="text-sm text-slate-700">{contractType.billing_model_label ?? getContractBillingModelLabel(contractType.billing_model)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">
                  {contractType.creator ? `${contractType.creator.name} (${contractType.creator.email})` : "Nao informado"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                <p className="text-sm text-slate-700">
                  {contractType.updater ? `${contractType.updater.name} (${contractType.updater.email})` : "Nao informado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Features e comportamento</CardTitle>
            <CardDescription>Dados retornados pelo `ContractTypeResource`.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-2">
                <ReceiptText className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-slate-900">Descricao do faturamento</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {contractType.billing_model_description ?? getContractBillingModelDescription(contractType.billing_model)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-slate-900">Features vinculadas</p>
              </div>
              {contractType.features?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {contractType.features.map((feature) => (
                    <Badge key={feature.id} variant="outline">
                      {feature.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-600">Nenhuma feature vinculada a este tipo no momento.</p>
              )}
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3">
              <p className="text-sm text-slate-600">
                Se este tipo ja estiver sendo usado em contratos, a exclusao pode ser recusada ou controlada pela API mesmo com `soft delete`.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
