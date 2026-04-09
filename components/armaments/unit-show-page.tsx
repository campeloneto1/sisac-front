"use client";

import { useParams } from "next/navigation";
import { AlertTriangle, CalendarClock, FileWarning, History, ShieldCheck } from "lucide-react";

import { formatArmamentLabel, formatDate, formatDateTime } from "@/components/armament-reports/shared";
import { ArmamentUnitsPageShell } from "@/components/armaments/units-page-shell";
import { useSubunit } from "@/contexts/subunit-context";
import { useArmamentUnit } from "@/hooks/use-armament-units";
import { useArmamentPanelReport } from "@/hooks/use-armament-reports";
import { usePermissions } from "@/hooks/use-permissions";
import { getArmamentUnitBadgeVariant } from "@/types/armament-unit.type";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ArmamentUnitShowPage() {
  const params = useParams<{ id: string; unitId: string }>();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("armaments");
  const unitQuery = useArmamentUnit(
    params.id,
    params.unitId,
    Boolean(activeSubunit && permissions.canView),
  );
  const panelQuery = useArmamentPanelReport(
    params.id,
    Boolean(activeSubunit && permissions.canView),
  );
  const unit = unitQuery.data?.data;
  const movements = panelQuery.data?.data.movements.filter(
    (item) => String(item.unit?.id) === params.unitId,
  ) ?? [];
  const occurrences = panelQuery.data?.data.occurrences.filter(
    (item) => String(item.unit?.id) === params.unitId,
  ) ?? [];
  const loans = panelQuery.data?.data.loans.filter((loan) =>
    loan.items?.some((item) => String(item.unit?.id ?? item.armament_unit_id) === params.unitId),
  ) ?? [];

  return (
    <ArmamentUnitsPageShell
      title="Detalhe da unidade"
      description="Visualize o contexto da unidade fisica vinculada ao armamento."
      requiredPermission="view"
      showIntegrationNotice={false}
    >
      {unitQuery.isLoading ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Carregando unidade</CardTitle>
            <CardDescription>
              Buscando o contexto operacional da unidade selecionada.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !unit ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Unidade não encontrada</CardTitle>
            <CardDescription>
              Esta unidade não foi encontrada para o armamento selecionado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <Card className="border-slate-200/70 bg-white/80">
            <CardHeader>
              <CardTitle>Unidade #{unit.id}</CardTitle>
              <CardDescription>
                Dados persistidos da unidade e histórico operacional relacionado.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Série
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {unit.serial_number ?? "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Status
                </p>
                <div className="mt-1">
                  <Badge variant={getArmamentUnitBadgeVariant(unit.status?.color)}>
                    {unit.status?.label ?? "-"}
                  </Badge>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Aquisição
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {formatDate(unit.acquisition_date)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Vencimento
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {formatDate(unit.expiration_date)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Situação operacional
                </p>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-700">
                  {unit.is_expired ? (
                    <>
                      <AlertTriangle className="h-4 w-4 text-rose-500" />
                      Vencida
                    </>
                  ) : unit.is_expiring_soon ? (
                    <>
                      <CalendarClock className="h-4 w-4 text-amber-500" />
                      A vencer
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      Regular
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Armamento
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {formatArmamentLabel(unit.armament)}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  Movimentações
                </CardTitle>
                <CardDescription>
                  Histórico encontrado no painel do armamento.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                {movements.length ? (
                  movements.slice(0, 5).map((movement) => (
                    <div
                      key={movement.id}
                      className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3"
                    >
                      <p className="font-medium text-slate-900">
                        {movement.type?.label ?? "Movimentação"}
                      </p>
                      <p>{formatDateTime(movement.moved_at)}</p>
                      <p>{movement.notes ?? "Sem observações."}</p>
                    </div>
                  ))
                ) : (
                  <p>Nenhuma movimentação vinculada a esta unidade.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileWarning className="h-4 w-4 text-primary" />
                  Ocorrências
                </CardTitle>
                <CardDescription>
                  Eventos operacionais associados a esta unidade.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                {occurrences.length ? (
                  occurrences.slice(0, 5).map((occurrence) => (
                    <div
                      key={occurrence.id}
                      className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3"
                    >
                      <p className="font-medium text-slate-900">
                        {occurrence.type?.label ?? "Ocorrência"}
                      </p>
                      <p>{formatDateTime(occurrence.occurred_at)}</p>
                      <p>{occurrence.status?.label ?? "Sem status"}</p>
                    </div>
                  ))
                ) : (
                  <p>Nenhuma ocorrência vinculada a esta unidade.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  Empréstimos
                </CardTitle>
                <CardDescription>
                  Registros de empréstimo que mencionam esta unidade.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                {loans.length ? (
                  loans.slice(0, 5).map((loan) => (
                    <div
                      key={loan.id}
                      className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3"
                    >
                      <p className="font-medium text-slate-900">
                        {loan.kind_label ?? loan.kind ?? "Empréstimo"}
                      </p>
                      <p>{formatDateTime(loan.loaned_at)}</p>
                      <p>{loan.status_label ?? loan.status ?? "Sem status"}</p>
                    </div>
                  ))
                ) : (
                  <p>Nenhum empréstimo vinculado a esta unidade.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </ArmamentUnitsPageShell>
  );
}
