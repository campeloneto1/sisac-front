"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarRange, FileText, ShieldAlert, UserCircle2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useLeaveType } from "@/hooks/use-leave-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LeaveTypeShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("leave-types");
  const leaveTypeQuery = useLeaveType(params.id);

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa da permissao `view` para visualizar tipos de afastamento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (leaveTypeQuery.isLoading) {
    return <Skeleton className="h-[480px] w-full" />;
  }

  if (leaveTypeQuery.isError || !leaveTypeQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar tipo de afastamento</CardTitle>
          <CardDescription>Os dados do tipo de afastamento nao estao disponiveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const leaveType = leaveTypeQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">{leaveType.name}</h1>
            <Badge variant="secondary">{leaveType.slug}</Badge>
          </div>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Tipo administrativo usado para padronizar afastamentos, regras medicas e impacto financeiro dentro do sistema.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/leave-types/${leaveType.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Regras do afastamento</CardTitle>
            <CardDescription>Configuracoes que orientam o uso do tipo de afastamento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Descricao</p>
              <p className="mt-1 text-sm text-slate-700">{leaveType.description || "Nao informada"}</p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <ShieldAlert className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Laudo medico</p>
                <p className="text-sm text-slate-700">{leaveType.requires_medical_report ? "Obrigatorio" : "Nao obrigatorio"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <FileText className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Impacto salarial</p>
                <p className="text-sm text-slate-700">{leaveType.affects_salary ? "Afeta salario" : "Nao afeta salario"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <CalendarRange className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Limite de dias</p>
                <p className="text-sm text-slate-700">{leaveType.max_days ? `${leaveType.max_days} dias` : "Nao definido"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Auditoria</CardTitle>
            <CardDescription>Informacoes de criacao e atualizacao do registro.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">
                  {leaveType.creator ? `${leaveType.creator.name} (${leaveType.creator.email})` : "Nao informado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                <p className="text-sm text-slate-700">
                  {leaveType.updater ? `${leaveType.updater.name} (${leaveType.updater.email})` : "Nao informado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
