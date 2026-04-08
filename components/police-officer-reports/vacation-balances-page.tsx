"use client";

import Link from "next/link";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { useMemo, useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficerVacationBalancesReport } from "@/hooks/use-police-officer-reports";
import { hasPermission } from "@/lib/permissions";
import type { PoliceOfficerReportFilters } from "@/types/police-officer-report.type";
import { PoliceOfficerVacationsFilters } from "@/components/police-officer-reports/vacations-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export function PoliceOfficerVacationBalancesReportPage() {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("police-officers");
  const [search, setSearch] = useState("");
  const [sectorId, setSectorId] = useState("all");
  const [vacationStatus, setVacationStatus] = useState("all");
  const [referenceYear, setReferenceYear] = useState("");
  const [vacationScope, setVacationScope] = useState("all");
  const [page, setPage] = useState(1);

  const filters = useMemo<PoliceOfficerReportFilters>(() => ({
    page,
    per_page: 15,
    search: search || undefined,
    sector_id: sectorId !== "all" ? Number(sectorId) : undefined,
    vacation_status: vacationStatus !== "all" ? vacationStatus : undefined,
    reference_year: referenceYear ? Number(referenceYear) : undefined,
    vacation_scope: vacationScope !== "all" ? (vacationScope as PoliceOfficerReportFilters["vacation_scope"]) : undefined,
  }), [page, referenceYear, search, sectorId, vacationScope, vacationStatus]);

  const reportQuery = usePoliceOfficerVacationBalancesReport(filters, Boolean(activeSubunit) && hasPermission(user, "reports") && permissions.canViewAny);

  if (!hasPermission(user, "reports") || !permissions.canViewAny) {
    return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Acesso negado</CardTitle><CardDescription>Você precisa do slug `reports` e da permissão `police-officers.viewAny` para acessar este relatório.</CardDescription></CardHeader></Card>;
  }
  if (!activeSubunit) {
    return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Selecione uma subunidade</CardTitle><CardDescription>Escolha uma subunidade ativa antes de gerar o relatório de saldo de férias.</CardDescription></CardHeader></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6">
        <Button asChild variant="ghost" className="px-2"><Link href="/police-officer-reports"><ArrowLeft className="mr-2 h-4 w-4" />Relatórios</Link></Button>
        <div className="mt-3 flex items-center gap-3">
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3 text-primary"><CalendarClock className="h-5 w-5" /></div>
          <div><h1 className="font-display text-3xl text-slate-900">Saldo de férias</h1><p className="mt-2 text-sm text-slate-600">Visão consolidada de dias usados, vendidos, restantes e disponíveis por policial.</p></div>
        </div>
      </div>

      <PoliceOfficerVacationsFilters
        search={search}
        sectorId={sectorId}
        vacationStatus={vacationStatus}
        referenceYear={referenceYear}
        vacationScope={vacationScope}
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
        onSectorChange={(value) => { setSectorId(value); setPage(1); }}
        onVacationStatusChange={(value) => { setVacationStatus(value); setPage(1); }}
        onReferenceYearChange={(value) => { setReferenceYear(value); setPage(1); }}
        onVacationScopeChange={(value) => { setVacationScope(value); setPage(1); }}
        onClear={() => { setSearch(""); setSectorId("all"); setVacationStatus("all"); setReferenceYear(""); setVacationScope("all"); setPage(1); }}
      />

      {reportQuery.isLoading ? (
        <div className="space-y-3"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
      ) : reportQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Erro ao gerar relatório</CardTitle><CardDescription>Não foi possível carregar os saldos de férias no momento.</CardDescription></CardHeader></Card>
      ) : !reportQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Nenhum saldo encontrado</CardTitle><CardDescription>Ajuste os filtros para ampliar o recorte do relatório.</CardDescription></CardHeader></Card>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Policial</th>
                    <th className="px-4 py-3 font-medium">Ano</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Dias</th>
                    <th className="px-4 py-3 font-medium">Validade</th>
                  </tr>
                </thead>
                <tbody>
                  {reportQuery.data.data.map((item) => (
                    <tr key={item.id} className="border-t border-slate-200/70">
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-900">{item.police_officer?.name ?? item.police_officer?.war_name ?? "Sem nome"}</p>
                        <p className="text-xs text-slate-500">{item.police_officer?.registration_number ?? "-"}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-700">{item.reference_year}</td>
                      <td className="px-4 py-4"><Badge variant="outline">{item.status?.label ?? "-"}</Badge></td>
                      <td className="px-4 py-4 text-slate-700">
                        <p>Total: {item.total_days}</p>
                        <p className="text-xs text-slate-500">Usados: {item.used_days} • Vendidos: {item.sold_days} • Disponíveis: {item.available_days}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {item.valid_from ?? "-"} até {item.valid_until ?? "-"}
                        <p className="text-xs text-slate-500">{item.is_expired ? "Expirada" : "Vigente"}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination currentPage={reportQuery.data.meta.current_page} lastPage={reportQuery.data.meta.last_page} total={reportQuery.data.meta.total} from={reportQuery.data.meta.from} to={reportQuery.data.meta.to} onPageChange={setPage} isDisabled={reportQuery.isFetching} />
        </div>
      )}
    </div>
  );
}
