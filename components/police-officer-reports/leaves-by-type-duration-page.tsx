"use client";

import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { useMemo, useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficerLeavesByTypeDurationReport } from "@/hooks/use-police-officer-reports";
import { hasPermission } from "@/lib/permissions";
import type { PoliceOfficerReportFilters } from "@/types/police-officer-report.type";
import { PoliceOfficerLeavesFilters } from "@/components/police-officer-reports/leaves-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PoliceOfficerLeavesByTypeDurationReportPage() {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("police-officers");
  const [search, setSearch] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("all");
  const [leaveStatus, setLeaveStatus] = useState("all");
  const [requiresCopem, setRequiresCopem] = useState("all");
  const [copemResult, setCopemResult] = useState("all");
  const [sectorId, setSectorId] = useState("all");
  const [rankId, setRankId] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filters = useMemo<PoliceOfficerReportFilters>(
    () => ({
      search: search || undefined,
      leave_type_id: leaveTypeId !== "all" ? Number(leaveTypeId) : undefined,
      leave_status: leaveStatus !== "all" ? leaveStatus : undefined,
      requires_copem: requiresCopem !== "all" ? requiresCopem === "true" : undefined,
      copem_result: copemResult !== "all" ? copemResult : undefined,
      sector_id: sectorId !== "all" ? Number(sectorId) : undefined,
      rank_id: rankId !== "all" ? Number(rankId) : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [copemResult, dateFrom, dateTo, leaveStatus, leaveTypeId, rankId, requiresCopem, search, sectorId],
  );

  const reportQuery = usePoliceOfficerLeavesByTypeDurationReport(
    filters,
    Boolean(activeSubunit) && hasPermission(user, "reports") && permissions.canViewAny,
  );

  if (!hasPermission(user, "reports") || !permissions.canViewAny) {
    return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Acesso negado</CardTitle><CardDescription>Você precisa do slug `reports` e da permissão `police-officers.viewAny` para acessar este relatório.</CardDescription></CardHeader></Card>;
  }
  if (!activeSubunit) {
    return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Selecione uma subunidade</CardTitle><CardDescription>Escolha uma subunidade ativa antes de gerar este relatório.</CardDescription></CardHeader></Card>;
  }

  const items = reportQuery.data?.data ?? [];
  const totals = items.reduce((acc, item) => ({ leaves: acc.leaves + item.total_leaves, days: acc.days + item.total_days }), { leaves: 0, days: 0 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6">
        <Button asChild variant="ghost" className="px-2"><Link href="/police-officer-reports"><ArrowLeft className="mr-2 h-4 w-4" />Relatórios</Link></Button>
        <div className="mt-3 flex items-center gap-3">
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3 text-primary"><BarChart3 className="h-5 w-5" /></div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">Afastamentos por tipo e duração</h1>
            <p className="mt-2 text-sm text-slate-600">Visão agregada dos afastamentos por tipo, volume total de ocorrências e duração média.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80"><CardHeader className="pb-2"><CardDescription>Total de afastamentos</CardDescription><CardTitle>{totals.leaves}</CardTitle></CardHeader></Card>
        <Card className="border-slate-200/70 bg-white/80"><CardHeader className="pb-2"><CardDescription>Total de dias</CardDescription><CardTitle>{totals.days}</CardTitle></CardHeader></Card>
      </div>

      <PoliceOfficerLeavesFilters
        search={search}
        leaveTypeId={leaveTypeId}
        leaveStatus={leaveStatus}
        requiresCopem={requiresCopem}
        copemResult={copemResult}
        sectorId={sectorId}
        rankId={rankId}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onSearchChange={setSearch}
        onLeaveTypeChange={setLeaveTypeId}
        onLeaveStatusChange={setLeaveStatus}
        onRequiresCopemChange={setRequiresCopem}
        onCopemResultChange={setCopemResult}
        onSectorChange={setSectorId}
        onRankChange={setRankId}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onClear={() => { setSearch(""); setLeaveTypeId("all"); setLeaveStatus("all"); setRequiresCopem("all"); setCopemResult("all"); setSectorId("all"); setRankId("all"); setDateFrom(""); setDateTo(""); }}
      />

      {reportQuery.isLoading ? (
        <div className="space-y-3"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
      ) : reportQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Erro ao gerar relatório</CardTitle><CardDescription>Não foi possível carregar os dados agregados de afastamentos.</CardDescription></CardHeader></Card>
      ) : !items.length ? (
        <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Nenhum resultado encontrado</CardTitle><CardDescription>Ajuste os filtros para ampliar o recorte do relatório.</CardDescription></CardHeader></Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={`${item.leave_type.id}-${item.leave_type.name}`} className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>{item.leave_type.name}</CardTitle>
                    <CardDescription>{item.leave_type.slug ?? "Sem slug"}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{item.total_leaves} afastamentos</Badge>
                    <Badge variant="outline">{item.total_days} dias</Badge>
                    <Badge variant="outline">Média {item.average_days}</Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
