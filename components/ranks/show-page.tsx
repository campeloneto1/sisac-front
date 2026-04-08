"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowUpWideNarrow, Clock3, ShieldAlert, UserCircle2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useRank } from "@/hooks/use-ranks";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RankShowPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("ranks");
  const rankQuery = useRank(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `ranks.view` para visualizar postos/graduações.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (rankQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (rankQuery.isError || !rankQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar posto/graduação</CardTitle>
          <CardDescription>Os dados do posto/graduação não estão disponíveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const rank = rankQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">{rank.name}</h1>
          <p className="mt-2 text-sm text-slate-500">Sigla: {rank.abbreviation}</p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Cadastro administrativo que representa a posição hierárquica usada no histórico funcional e nas regras de promoção.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/ranks/${rank.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Visao geral</CardTitle>
            <CardDescription>Indicadores rapidos do posto/graduação.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <ArrowUpWideNarrow className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Nivel hierarquico</p>
                <p className="text-sm text-slate-700">{rank.hierarchy_level}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Clock3 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Intersticio</p>
                <p className="text-sm text-slate-700">
                  {rank.interstice !== null ? `${rank.interstice} meses` : "Não informado"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">{rank.creator ? `${rank.creator.name} (${rank.creator.email})` : "Não informado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                <p className="text-sm text-slate-700">{rank.updater ? `${rank.updater.name} (${rank.updater.email})` : "Não informado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Impacto operacional</CardTitle>
            <CardDescription>Contexto funcional do cadastro de posto/graduação.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <p className="text-sm font-medium text-slate-900">Hierarquia estruturante</p>
              <p className="mt-2 text-sm text-slate-600">
                Este cadastro deve permanecer coerente porque pode ser referenciado por históricos de postos e regras relacionadas a promoção.
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
              <ShieldAlert className="mt-0.5 h-4 w-4 text-amber-700" />
              <p className="text-sm text-amber-800">
                A exclusão pode ser recusada pela policy se este posto/graduação estiver vinculado a registros em `police_officer_ranks`.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
