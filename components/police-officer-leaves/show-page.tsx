"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, FileText, HeartPulse, ShieldAlert, UserCircle2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficerLeave } from "@/hooks/use-police-officer-leaves";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function getStatusVariant(status?: string | null) {
  switch (status) {
    case "approved":
    case "copem_approved":
    case "returned_to_work":
      return "success";
    case "rejected":
    case "copem_rejected":
      return "danger";
    case "awaiting_copem":
    case "copem_scheduled":
    case "in_copem_evaluation":
      return "warning";
    case "ongoing":
    case "requested":
      return "info";
    default:
      return "secondary";
  }
}

export function PoliceOfficerLeaveShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("police-officer-leaves");
  const policeOfficerLeaveQuery = usePoliceOfficerLeave(params.id);

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `view` para visualizar afastamentos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (policeOfficerLeaveQuery.isLoading) {
    return <Skeleton className="h-[560px] w-full" />;
  }

  if (policeOfficerLeaveQuery.isError || !policeOfficerLeaveQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar afastamento</CardTitle>
          <CardDescription>Os dados do afastamento não estão disponíveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const leave = policeOfficerLeaveQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">
              {leave.police_officer?.name ?? leave.police_officer?.user?.name ?? leave.police_officer?.war_name ?? `Policial #${leave.police_officer_id}`}
            </h1>
            <Badge variant={getStatusVariant(leave.status?.value)}>{leave.status?.label ?? "Sem status"}</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {leave.leave_type?.name ?? `Tipo #${leave.leave_type_id}`} • {leave.start_date ?? "-"} ate {leave.end_date ?? "-"}
          </p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Registro completo do afastamento, incluindo dados médicos, regra de renovação, auditoria e acompanhamento de COPEM.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/police-officer-leaves/${leave.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Visao operacional</CardTitle>
            <CardDescription>Informações principais do afastamento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Período</p>
                <p className="text-sm text-slate-700">
                  {leave.start_date ?? "-"} ate {leave.end_date ?? "-"} {leave.days ? `(${leave.days} dias)` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <HeartPulse className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Dados médicos</p>
                <p className="text-sm text-slate-700">
                  CRM: {leave.crm_number ?? "-"} • CID: {leave.cid_code ?? "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <ShieldAlert className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">COPEM</p>
                <p className="text-sm text-slate-700">
                  {leave.requires_copem ? "Requer acompanhamento COPEM" : "Não requer COPEM"}
                  {leave.copem_result ? ` • ${leave.copem_result.label}` : ""}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Observações</p>
              <p className="mt-1 text-sm text-slate-700">{leave.notes || "Não informadas"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Contexto e auditoria</CardTitle>
            <CardDescription>Relacionamentos, renovação e responsáveis pela alteração.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Policial</p>
              <p className="mt-1 text-sm text-slate-700">
                {leave.police_officer?.name ?? leave.police_officer?.user?.name ?? leave.police_officer?.war_name ?? `Policial #${leave.police_officer_id}`}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Tipo</p>
              <p className="mt-1 text-sm text-slate-700">{leave.leave_type?.name ?? `Tipo #${leave.leave_type_id}`}</p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Renovação</p>
              <p className="mt-1 text-sm text-slate-700">
                {leave.is_renewal ? `Sim${leave.previous_leave ? ` • referência #${leave.previous_leave.id}` : ""}` : "Não"}
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">{leave.creator ? `${leave.creator.name} (${leave.creator.email})` : "Não informado"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                <p className="text-sm text-slate-700">{leave.updater ? `${leave.updater.name} (${leave.updater.email})` : "Não informado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Detalhes de COPEM</CardTitle>
            <CardDescription>Protocolo, agenda e resultado quando houver acompanhamento.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Protocolo</p>
              <p className="mt-1 text-sm text-slate-700">{leave.copem_protocol ?? "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Resultado</p>
              <p className="mt-1 text-sm text-slate-700">{leave.copem_result?.label ?? "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Pericia</p>
              <p className="mt-1 text-sm text-slate-700">{leave.copem_scheduled_date ?? "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Avaliação</p>
              <p className="mt-1 text-sm text-slate-700">{leave.copem_evaluation_date ?? "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 md:col-span-2">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Laudo/observações</p>
              <p className="mt-1 text-sm text-slate-700">{leave.copem_notes || leave.copem_report_date || "Não informados"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Relacionamentos</CardTitle>
            <CardDescription>Afastamento anterior, renovacoes e anexos retornados pela API.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Afastamento anterior</p>
              <p className="mt-1 text-sm text-slate-700">
                {leave.previous_leave ? `#${leave.previous_leave.id} • ${leave.previous_leave.start_date ?? "-"} ate ${leave.previous_leave.end_date ?? "-"}` : "Não informado"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Renovacoes</p>
              {leave.renewals?.length ? (
                <div className="mt-2 space-y-2">
                  {leave.renewals.map((renewal) => (
                    <p key={renewal.id} className="text-sm text-slate-700">
                      #{renewal.id} • {renewal.start_date ?? "-"} ate {renewal.end_date ?? "-"}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-slate-700">Nenhuma renovação retornada.</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Uploads</p>
              </div>
              {leave.uploads?.length ? (
                <div className="mt-2 space-y-2">
                  {leave.uploads.map((upload) => (
                    <p key={upload.id} className="text-sm text-slate-700">
                      {upload.original_name ?? upload.file_name ?? `Arquivo #${upload.id}`}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-700">Nenhum upload retornado pela API.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
