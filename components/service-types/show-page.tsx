"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FileText, ShieldCheck, TimerReset, UserCircle2, Wrench } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useServiceType } from "@/hooks/use-service-types";
import { hasPermission } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ServiceTypeShowPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("service-types");
  const serviceTypeQuery = useServiceType(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa de `administrator` e `service-types.view` para
            visualizar tipos de serviço.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (serviceTypeQuery.isLoading) {
    return <Skeleton className="h-[460px] w-full" />;
  }

  if (serviceTypeQuery.isError || !serviceTypeQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar tipo de serviço</CardTitle>
          <CardDescription>
            Os dados do tipo de serviço não estão disponíveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const serviceType = serviceTypeQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">
              {serviceType.name}
            </h1>
            <Badge variant={serviceType.active ? "success" : "secondary"}>
              {serviceType.active ? "Ativo" : "Inativo"}
            </Badge>
            <Badge variant={serviceType.requires_approval ? "info" : "outline"}>
              {serviceType.requires_approval ? "Requer aprovacao" : "Sem aprovacao"}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Codigo: {serviceType.code}
          </p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            {serviceType.description?.trim() ||
              "Tipo administrativo global usado para classificar serviços em outros fluxos do sistema."}
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/service-types/${serviceType.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Visao geral</CardTitle>
            <CardDescription>
              Dados principais do tipo cadastrado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Wrench className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Nome
                </p>
                <p className="text-sm text-slate-700">{serviceType.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Codigo
                </p>
                <p className="text-sm text-slate-700">{serviceType.code}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <TimerReset className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Duracao estimada
                </p>
                <p className="text-sm text-slate-700">
                  {serviceType.estimated_duration_hours
                    ? `${serviceType.estimated_duration_hours} hora(s)`
                    : "Não informada"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <FileText className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Descrição
                </p>
                <p className="text-sm text-slate-700">
                  {serviceType.description?.trim() || "Não informada"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Metadados</CardTitle>
            <CardDescription>
              Usuários responsáveis pelo cadastro e auditoria.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Criado por
                </p>
                <p className="text-sm text-slate-700">
                  {serviceType.creator
                    ? `${serviceType.creator.name} (${serviceType.creator.email})`
                    : "Não informado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Atualizado por
                </p>
                <p className="text-sm text-slate-700">
                  {serviceType.updater
                    ? `${serviceType.updater.name} (${serviceType.updater.email})`
                    : "Não informado"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Timestamps
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Criado em: {serviceType.created_at ?? "-"}
              </p>
              <p className="text-sm text-slate-700">
                Atualizado em: {serviceType.updated_at ?? "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
