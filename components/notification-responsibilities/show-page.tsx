"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BellRing, Building2, ShieldCheck, UserCircle2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { useNotificationResponsibility } from "@/hooks/use-notification-responsibilities";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { getNotificationResponsibilityDomainLabel } from "@/types/notification-responsibility.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function NotificationResponsibilityShowPage() {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("notification-responsibilities");
  const itemQuery = useNotificationResponsibility(params.id, Boolean(activeSubunit));

  if (!hasPermission(user, "administrator") || !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa de `administrator` e `notification-responsibilities.view` para visualizar esta configuração.
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
          <CardDescription>O detalhe depende do contexto ativo para enviar o header `X-Active-Subunit`.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (itemQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (itemQuery.isError || !itemQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar responsabilidade</CardTitle>
          <CardDescription>Os dados da responsabilidade de notificação não estão disponíveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const item = itemQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">{getNotificationResponsibilityDomainLabel(item.domain)}</h1>
            <Badge variant="info">{item.domain}</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">Subunidade: {item.subunit?.name ?? `#${item.subunit_id}`}</p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Esta regra define qual setor recebe as notificações automaticas desse dominio dentro da subunidade configurada.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/notification-responsibilities/${item.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Visao geral</CardTitle>
            <CardDescription>Resumo rápido da configuração.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <BellRing className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Dominio</p>
                <p className="text-sm text-slate-700">{getNotificationResponsibilityDomainLabel(item.domain)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">{item.creator ? `${item.creator.name} (${item.creator.email})` : "Não informado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                <p className="text-sm text-slate-700">{item.updater ? `${item.updater.name} (${item.updater.email})` : "Não informado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Destino das notificações</CardTitle>
            <CardDescription>Dados retornados pelo `NotificationResponsibilityResource`.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-slate-900">Subunidade vinculada</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {item.subunit ? `${item.subunit.name} (${item.subunit.abbreviation ?? "Sem sigla"})` : `Subunidade #${item.subunit_id}`}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-slate-900">Setor responsável</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {item.sector ? `${item.sector.name} (${item.sector.abbreviation ?? "Sem sigla"})` : `Setor #${item.sector_id}`}
              </p>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3">
              <p className="text-sm text-slate-600">
                Se essa configuração ficar ausente ou incorreta, o resolvedor de destinatarios pode não encontrar usuários para esse dominio.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
