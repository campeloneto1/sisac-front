"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, Coins, FileText, TimerReset, UserCircle2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficerVacation } from "@/hooks/use-police-officer-vacations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PoliceOfficerVacationPeriodsSection } from "@/components/police-officer-vacations/periods-section";

function getStatusVariant(status?: string | null) {
  switch (status) {
    case "completed":
      return "success";
    case "expired":
      return "danger";
    case "partial":
      return "warning";
    case "sold":
      return "secondary";
    case "cancelled":
      return "secondary";
    default:
      return "info";
  }
}

export function PoliceOfficerVacationShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("police-officer-vacations");
  const vacationQuery = usePoliceOfficerVacation(params.id);

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `view` para visualizar férias.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (vacationQuery.isLoading) {
    return <Skeleton className="h-[560px] w-full" />;
  }

  if (vacationQuery.isError || !vacationQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar férias</CardTitle>
          <CardDescription>Os dados do registro anual não estão disponíveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const vacation = vacationQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">
              {vacation.police_officer?.name ?? vacation.police_officer?.user?.name ?? vacation.police_officer?.war_name ?? `Policial #${vacation.police_officer_id}`}
            </h1>
            <Badge variant={getStatusVariant(vacation.status?.value)}>{vacation.status?.label ?? "Sem status"}</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Férias de {vacation.reference_year} • validade {vacation.valid_from ?? "-"} ate {vacation.valid_until ?? "-"}
          </p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Registro anual de férias com saldo, boletins e planejamento de períodos de gozo para o policial.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/police-officer-vacations/${vacation.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Saldo e vigência</CardTitle>
            <CardDescription>Visao resumida do saldo anual e da janela válida para gozo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total de dias</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{vacation.total_days}</p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Dias usados</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{vacation.used_days ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Dias vendidos</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{vacation.sold_days ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Disponíveis para gozo</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{vacation.available_days ?? vacation.remaining_days ?? 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Vigência</p>
                <p className="text-sm text-slate-700">{vacation.valid_from ?? "-"} ate {vacation.valid_until ?? "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <TimerReset className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Expiracao</p>
                <p className="text-sm text-slate-700">{vacation.is_expired ? "Registro expirado" : "Dentro do prazo de gozo"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Boletins e auditoria</CardTitle>
            <CardDescription>Documentos relacionados ao saldo, fracionamento e venda de dias.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Boletim de autorização</p>
              </div>
              <p className="mt-1 text-sm text-slate-700">{vacation.authorization_bulletin ?? "Não informado"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Boletim de fracionamento</p>
              </div>
              <p className="mt-1 text-sm text-slate-700">{vacation.fractionation_bulletin ?? "Não informado"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-primary" />
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Boletim de venda</p>
              </div>
              <p className="mt-1 text-sm text-slate-700">{vacation.sale_bulletin ?? "Não informado"}</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">{vacation.creator ? `${vacation.creator.name} (${vacation.creator.email})` : "Não informado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <PoliceOfficerVacationPeriodsSection vacation={vacation} />
    </div>
  );
}
