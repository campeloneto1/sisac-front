"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Sparkles, UserCircle2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useContractFeature } from "@/hooks/use-contract-features";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ContractFeatureShowPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("contract-features");
  const contractFeatureQuery = useContractFeature(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `contract-features.view` para visualizar caracteristicas.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (contractFeatureQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (contractFeatureQuery.isError || !contractFeatureQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar caracteristica</CardTitle>
          <CardDescription>Os dados da caracteristica nao estao disponiveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const contractFeature = contractFeatureQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">{contractFeature.name}</h1>
          </div>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Caracteristica administrativa global que pode ser associada a tipos de contrato para indicar capacidades ou regras extras.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/contract-features/${contractFeature.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Visao geral</CardTitle>
            <CardDescription>Indicadores rapidos da caracteristica.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Nome</p>
                <p className="text-sm text-slate-700">{contractFeature.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">
                  {contractFeature.creator ? `${contractFeature.creator.name} (${contractFeature.creator.email})` : "Nao informado"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                <p className="text-sm text-slate-700">
                  {contractFeature.updater ? `${contractFeature.updater.name} (${contractFeature.updater.email})` : "Nao informado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Uso e impacto</CardTitle>
            <CardDescription>Resumo funcional com base no relacionamento com `contract-types`.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-slate-900">Uso esperado</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Essa caracteristica pode ser vinculada a tipos de contrato para habilitar classificacoes extras, regras funcionais ou agrupamentos
                administrativos no dominio de contratos.
              </p>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3">
              <p className="text-sm text-slate-600">
                A API atual nao retorna a contagem de tipos vinculados. Ainda assim, a exclusao pode ser recusada caso exista relacionamento ativo
                pela pivot `contract_type_feature`.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
