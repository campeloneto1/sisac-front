"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Building2, Landmark, UserCircle2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useBank } from "@/hooks/use-banks";
import { hasPermission } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BankShowPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("banks");
  const bankQuery = useBank(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `banks.view` para visualizar bancos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (bankQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (bankQuery.isError || !bankQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar banco</CardTitle>
          <CardDescription>Os dados do banco não estão disponíveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const bank = bankQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">{bank.name}</h1>
            <Badge variant="outline">{bank.code}</Badge>
          </div>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Banco cadastrado no módulo administrativo para apoiar cadastros financeiros e de policiais.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/banks/${bank.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Visao geral</CardTitle>
            <CardDescription>Indicadores rapidos do banco.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Landmark className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Codigo</p>
                <p className="text-sm text-slate-700">{bank.code}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">{bank.creator ? `${bank.creator.name} (${bank.creator.email})` : "Não informado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                <p className="text-sm text-slate-700">{bank.updater ? `${bank.updater.name} (${bank.updater.email})` : "Não informado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Uso administrativo</CardTitle>
            <CardDescription>Contexto funcional do cadastro de banco.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-slate-900">Cadastro global</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Este banco pode ser referenciado por policiais e outros módulos que dependam de instituicoes financeiras.
              </p>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3">
              <p className="text-sm text-slate-600">
                Se existirem policiais vinculados a este banco, a exclusão pode ser recusada pela API ou pelo banco de dados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
