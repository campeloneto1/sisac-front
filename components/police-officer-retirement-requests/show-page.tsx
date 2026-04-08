"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  FileText,
  Newspaper,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficerRetirementRequest } from "@/hooks/use-police-officer-retirement-requests";
import {
  RETIREMENT_REQUEST_STATUS_LABELS,
  type PoliceOfficerRetirementRequestStatus,
} from "@/types/police-officer-retirement-request.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function getStatusVariant(status: PoliceOfficerRetirementRequestStatus) {
  switch (status) {
    case "approved":
    case "published":
      return "success";
    case "denied":
    case "cancelled":
      return "danger";
    case "in_analysis":
      return "warning";
    case "requested":
    default:
      return "secondary";
  }
}

export function PoliceOfficerRetirementRequestShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("police-officer-retirement-requests");
  const retirementRequestQuery = usePoliceOfficerRetirementRequest(params.id);

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `view` para visualizar requerimentos de
            aposentadoria.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (retirementRequestQuery.isLoading) {
    return <Skeleton className="h-[560px] w-full" />;
  }

  if (retirementRequestQuery.isError || !retirementRequestQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar requerimento</CardTitle>
          <CardDescription>
            Os dados do requerimento não estão disponíveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const retirementRequest = retirementRequestQuery.data.data;
  const policeOfficerName =
    retirementRequest.police_officer?.name ??
    retirementRequest.police_officer?.user?.name ??
    retirementRequest.police_officer?.war_name ??
    `Policial #${retirementRequest.police_officer_id}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">
              {retirementRequest.nup || policeOfficerName}
            </h1>
            <Badge variant={getStatusVariant(retirementRequest.status)}>
              {RETIREMENT_REQUEST_STATUS_LABELS[retirementRequest.status]}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {policeOfficerName} • solicitação em{" "}
            {retirementRequest.requested_at ?? "-"}
          </p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Acompanhamento completo do requerimento de aposentadoria, com
            datas-chave, boletins e auditoria.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link
              href={`/police-officer-retirement-requests/${retirementRequest.id}/edit`}
            >
              Editar
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Fluxo do requerimento</CardTitle>
            <CardDescription>
              Dados principais e marco temporal do processo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                NUP
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {retirementRequest.nup ?? "Não informado"}
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Data do requerimento
                </p>
                <p className="text-sm text-slate-700">
                  {retirementRequest.requested_at ?? "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Data de aprovacao
                </p>
                <p className="text-sm text-slate-700">
                  {retirementRequest.approved_at ?? "Não informada"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Newspaper className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Data de publicação
                </p>
                <p className="text-sm text-slate-700">
                  {retirementRequest.published_at ?? "Não informada"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Observações
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                {retirementRequest.notes || "Não informadas"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Contexto e auditoria</CardTitle>
            <CardDescription>
              Relacionamento com o policial, boletins e usuários responsáveis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Policial
              </p>
              <p className="mt-1 text-sm text-slate-700">{policeOfficerName}</p>
              <p className="mt-1 text-xs text-slate-500">
                Matrícula:{" "}
                {retirementRequest.police_officer?.registration_number ??
                  "Não informada"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Boletim de requerimento
                </p>
              </div>
              <p className="mt-1 text-sm text-slate-700">
                {retirementRequest.bulletin_request ?? "Não informado"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Boletim de publicação
                </p>
              </div>
              <p className="mt-1 text-sm text-slate-700">
                {retirementRequest.bulletin_publication ?? "Não informado"}
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Criado por
                </p>
                <p className="text-sm text-slate-700">
                  {retirementRequest.creator
                    ? `${retirementRequest.creator.name} (${retirementRequest.creator.email})`
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
                  {retirementRequest.updater
                    ? `${retirementRequest.updater.name} (${retirementRequest.updater.email})`
                    : "Não informado"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Timestamps
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Criado em: {retirementRequest.created_at ?? "-"}
              </p>
              <p className="text-sm text-slate-700">
                Atualizado em: {retirementRequest.updated_at ?? "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
