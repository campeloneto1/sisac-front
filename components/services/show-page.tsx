"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BriefcaseBusiness, CalendarDays, DollarSign, FileText, History, MapPin, Pencil, ShieldCheck, Star, UserCircle2 } from "lucide-react";

import { useSubunit } from "@/contexts/subunit-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useService } from "@/hooks/use-services";
import { getServicePriorityVariant, getServiceStatusVariant } from "@/types/service.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Não informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCurrency(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "Não informado";
  }

  const parsed = typeof value === "number" ? value : Number(value);

  if (Number.isNaN(parsed)) {
    return String(value);
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parsed);
}

export function ServiceShowPage() {
  const params = useParams<{ id: string }>();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("services");
  const historyPermissions = usePermissions("service-status-history");
  const serviceQuery = useService(params.id, Boolean(activeSubunit) && permissions.canView);

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `view` para visualizar serviços.
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
            O módulo de serviços depende da subunidade ativa para carregar o registro.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (serviceQuery.isLoading) {
    return <Skeleton className="h-[720px] w-full" />;
  }

  if (serviceQuery.isError || !serviceQuery.data?.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar serviço</CardTitle>
          <CardDescription>
            Os dados do serviço não estão disponíveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const service = serviceQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">
              {service.service_type?.name || `Serviço #${service.id}`}
            </h1>
            {service.status ? (
              <Badge variant={getServiceStatusVariant(service.status)}>
                {service.status_label || service.status}
              </Badge>
            ) : null}
            {service.priority ? (
              <Badge variant={getServicePriorityVariant(service.priority)}>
                {service.priority_label || service.priority}
              </Badge>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Empresa: {service.company?.trade_name || service.company?.name || "Não informada"}
          </p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            {service.request_description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {historyPermissions.canViewAny || historyPermissions.canView ? (
            <Button asChild variant="outline">
              <Link href={`/services/${service.id}/status-history`}>
                <History className="mr-2 h-4 w-4" />
                Histórico de status
              </Link>
            </Button>
          ) : null}

          {permissions.canUpdate ? (
            <Button asChild variant="outline">
              <Link href={`/services/${service.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Contexto da solicitação</CardTitle>
            <CardDescription>
              Empresa, tipo, solicitante e setor relacionados ao serviço.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <BriefcaseBusiness className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Empresa</p>
                <p className="text-sm text-slate-700">
                  {service.company?.trade_name || service.company?.name || "Não informada"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Tipo de serviço</p>
                <p className="text-sm text-slate-700">
                  {service.service_type?.name || "Não informado"}
                </p>
                <p className="text-sm text-slate-500">
                  Codigo: {service.service_type?.code || "-"}
                </p>
                <p className="text-sm text-slate-500">
                  {service.service_type?.requires_approval
                    ? "Requer aprovacao"
                    : "Não requer aprovacao obrigatória"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Solicitante</p>
                <p className="text-sm text-slate-700">
                  {service.requester?.name || `Usuário #${service.requested_by}`}
                </p>
                <p className="text-sm text-slate-500">
                  {service.requester?.email || "Sem e-mail vinculado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Setor e localização</p>
                <p className="text-sm text-slate-700">
                  {service.sector?.abbreviation || service.sector?.name || "Setor não informado"}
                </p>
                <p className="text-sm text-slate-500">
                  {service.location || "Localização não informada"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <FileText className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Contrato</p>
                <p className="text-sm text-slate-700">
                  {service.contract_id ? `Contrato #${service.contract_id}` : "Sem contrato"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Cronologia e custos</CardTitle>
            <CardDescription>
              Datas de solicitação, execução e acompanhamento financeiro.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Datas</p>
                <p className="text-sm text-slate-700">Solicitado em {formatDateTime(service.requested_at)}</p>
                <p className="text-sm text-slate-500">Agendado para {formatDateTime(service.scheduled_date)}</p>
                <p className="text-sm text-slate-500">Início: {formatDateTime(service.started_at)} • Fim: {formatDateTime(service.finished_at)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <DollarSign className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Custos</p>
                <p className="text-sm text-slate-700">
                  Estimado: {formatCurrency(service.estimated_cost)}
                </p>
                <p className="text-sm text-slate-500">
                  Real: {formatCurrency(service.actual_cost)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Star className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Avaliação</p>
                <p className="text-sm text-slate-700">
                  {service.rating ? `${service.rating}/5` : "Não avaliado"}
                </p>
                <p className="text-sm text-slate-500">
                  {service.rating_comment || "Sem comentario"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Observações operacionais</CardTitle>
          <CardDescription>
            Detalhes de execução, conclusão ou cancelamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Início</p>
            <p className="mt-1 text-sm text-slate-700">
              {service.start_observations || "Não informada"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Término</p>
            <p className="mt-1 text-sm text-slate-700">
              {service.finish_observations || "Não informada"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Cancelamento</p>
            <p className="mt-1 text-sm text-slate-700">
              {service.cancellation_reason || "Não informado"}
            </p>
          </div>
        </CardContent>
      </Card>

      {(historyPermissions.canViewAny || historyPermissions.canView) ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Histórico de status</CardTitle>
            <CardDescription>
              Acompanhe a trilha de auditoria das transições de estado desse serviço.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href={`/services/${service.id}/status-history`}>
                <History className="mr-2 h-4 w-4" />
                Abrir histórico
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Auditoria</CardTitle>
          <CardDescription>
            Usuários responsáveis pelo cadastro e última atualização.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
            <p className="mt-1 text-sm text-slate-700">
              {service.creator ? `${service.creator.name} (${service.creator.email})` : "Não informado"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
            <p className="mt-1 text-sm text-slate-700">
              {service.updater ? `${service.updater.name} (${service.updater.email})` : "Não informado"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
