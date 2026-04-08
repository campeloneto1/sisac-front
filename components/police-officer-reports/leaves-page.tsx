"use client";

import Link from "next/link";
import { ArrowLeft, FileHeart } from "lucide-react";
import { useMemo, useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficerLeavesReport } from "@/hooks/use-police-officer-reports";
import { hasPermission } from "@/lib/permissions";
import type { PoliceOfficerReportFilters } from "@/types/police-officer-report.type";
import { PoliceOfficerLeavesFilters } from "@/components/police-officer-reports/leaves-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export function PoliceOfficerLeavesReportPage() {
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
  const [page, setPage] = useState(1);

  const filters = useMemo<PoliceOfficerReportFilters>(
    () => ({
      page,
      per_page: 15,
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
    [copemResult, dateFrom, dateTo, leaveStatus, leaveTypeId, page, rankId, requiresCopem, search, sectorId],
  );

  const reportQuery = usePoliceOfficerLeavesReport(
    filters,
    Boolean(activeSubunit) && hasPermission(user, "reports") && permissions.canViewAny,
  );

  if (!hasPermission(user, "reports") || !permissions.canViewAny) {
    return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Acesso negado</CardTitle><CardDescription>Você precisa do slug `reports` e da permissão `police-officers.viewAny` para acessar este relatório.</CardDescription></CardHeader></Card>;
  }
  if (!activeSubunit) {
    return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Selecione uma subunidade</CardTitle><CardDescription>Escolha uma subunidade ativa antes de gerar o relatório de afastamentos.</CardDescription></CardHeader></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6">
        <div>
          <Button asChild variant="ghost" className="px-2">
            <Link href="/police-officer-reports"><ArrowLeft className="mr-2 h-4 w-4" />Relatórios</Link>
          </Button>
          <div className="mt-3 flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3 text-primary"><FileHeart className="h-5 w-5" /></div>
            <div>
              <h1 className="font-display text-3xl text-slate-900">Afastamentos</h1>
              <p className="mt-2 text-sm text-slate-600">Listagem operacional de afastamentos com foco em status, COPEM, tipo e vigência.</p>
            </div>
          </div>
        </div>
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
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
        onLeaveTypeChange={(value) => { setLeaveTypeId(value); setPage(1); }}
        onLeaveStatusChange={(value) => { setLeaveStatus(value); setPage(1); }}
        onRequiresCopemChange={(value) => { setRequiresCopem(value); setPage(1); }}
        onCopemResultChange={(value) => { setCopemResult(value); setPage(1); }}
        onSectorChange={(value) => { setSectorId(value); setPage(1); }}
        onRankChange={(value) => { setRankId(value); setPage(1); }}
        onDateFromChange={(value) => { setDateFrom(value); setPage(1); }}
        onDateToChange={(value) => { setDateTo(value); setPage(1); }}
        onClear={() => {
          setSearch(""); setLeaveTypeId("all"); setLeaveStatus("all"); setRequiresCopem("all");
          setCopemResult("all"); setSectorId("all"); setRankId("all"); setDateFrom(""); setDateTo(""); setPage(1);
        }}
      />

      {reportQuery.isLoading ? (
        <div className="space-y-3"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
      ) : reportQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Erro ao gerar relatório</CardTitle><CardDescription>Não foi possível carregar os afastamentos no momento.</CardDescription></CardHeader></Card>
      ) : !reportQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Nenhum afastamento encontrado</CardTitle><CardDescription>Ajuste os filtros para ampliar o recorte do relatório.</CardDescription></CardHeader></Card>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Policial</th>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Período</th>
                    <th className="px-4 py-3 font-medium">COPEM</th>
                  </tr>
                </thead>
                <tbody>
                  {reportQuery.data.data.map((item) => (
                    <tr key={item.id} className="border-t border-slate-200/70">
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-900">{item.police_officer?.name ?? item.police_officer?.war_name ?? "Sem nome"}</p>
                        <p className="text-xs text-slate-500">
                          {item.police_officer?.registration_number ?? "-"} • {item.police_officer?.war_name ?? "-"}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-slate-700">{item.leave_type?.name ?? "-"}</td>
                      <td className="px-4 py-4">
                        <Badge variant="outline">{item.status?.label ?? "-"}</Badge>
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {item.start_date ?? "-"} até {item.end_date ?? "-"}
                        <p className="text-xs text-slate-500">{item.days ?? 0} dia(s)</p>
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        <p>{item.requires_copem ? "Exige COPEM" : "Sem COPEM"}</p>
                        <p className="text-xs text-slate-500">{item.copem_result?.label ?? item.copem_scheduled_date ?? "-"}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination
            currentPage={reportQuery.data.meta.current_page}
            lastPage={reportQuery.data.meta.last_page}
            total={reportQuery.data.meta.total}
            from={reportQuery.data.meta.from}
            to={reportQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={reportQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
