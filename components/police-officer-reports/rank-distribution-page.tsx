"use client";

import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { useMemo, useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficerRankDistributionReport } from "@/hooks/use-police-officer-reports";
import { hasPermission } from "@/lib/permissions";
import type { PoliceOfficerReportFilters } from "@/types/police-officer-report.type";
import { PoliceOfficerAggregateFilters } from "@/components/police-officer-reports/aggregate-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PoliceOfficerRankDistributionReportPage() {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("police-officers");
  const [search, setSearch] = useState("");
  const [sectorId, setSectorId] = useState("all");
  const [assignmentId, setAssignmentId] = useState("all");
  const [rankId, setRankId] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");

  const filters = useMemo<PoliceOfficerReportFilters>(
    () => ({
      search: search || undefined,
      sector_id: sectorId !== "all" ? Number(sectorId) : undefined,
      assignment_id: assignmentId !== "all" ? Number(assignmentId) : undefined,
      rank_id: rankId !== "all" ? Number(rankId) : undefined,
      is_active: activeStatus === "all" ? undefined : activeStatus === "active",
    }),
    [activeStatus, assignmentId, rankId, search, sectorId],
  );

  const reportQuery = usePoliceOfficerRankDistributionReport(
    filters,
    Boolean(activeSubunit) && hasPermission(user, "reports") && permissions.canViewAny,
  );

  if (!hasPermission(user, "reports") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa do slug `reports` e da permissão `police-officers.viewAny` para acessar este relatório.
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
          <CardDescription>Escolha uma subunidade ativa antes de gerar a distribuição por graduação.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const items = reportQuery.data?.data ?? [];
  const totals = items.reduce(
    (accumulator, item) => ({
      ranks: accumulator.ranks + 1,
      officers: accumulator.officers + item.total_officers,
      active: accumulator.active + item.active_officers,
      inactive: accumulator.inactive + item.inactive_officers,
    }),
    { ranks: 0, officers: 0, active: 0, inactive: 0 },
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Button asChild variant="ghost" className="px-2">
            <Link href="/police-officer-reports">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Relatórios
            </Link>
          </Button>
          <div className="mt-3 flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3 text-primary">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-slate-900">Distribuição por graduação</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Resumo analítico da composição hierárquica atual, com totais de ativos e inativos por graduação.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-200/70 bg-white/80"><CardHeader className="pb-2"><CardDescription>Graduações</CardDescription><CardTitle>{totals.ranks}</CardTitle></CardHeader></Card>
        <Card className="border-slate-200/70 bg-white/80"><CardHeader className="pb-2"><CardDescription>Efetivo total</CardDescription><CardTitle>{totals.officers}</CardTitle></CardHeader></Card>
        <Card className="border-slate-200/70 bg-white/80"><CardHeader className="pb-2"><CardDescription>Ativos</CardDescription><CardTitle>{totals.active}</CardTitle></CardHeader></Card>
        <Card className="border-slate-200/70 bg-white/80"><CardHeader className="pb-2"><CardDescription>Inativos</CardDescription><CardTitle>{totals.inactive}</CardTitle></CardHeader></Card>
      </div>

      <PoliceOfficerAggregateFilters
        search={search}
        sectorId={sectorId}
        assignmentId={assignmentId}
        rankId={rankId}
        activeStatus={activeStatus}
        onSearchChange={setSearch}
        onSectorChange={setSectorId}
        onAssignmentChange={setAssignmentId}
        onRankChange={setRankId}
        onActiveStatusChange={setActiveStatus}
        onClear={() => {
          setSearch("");
          setSectorId("all");
          setAssignmentId("all");
          setRankId("all");
          setActiveStatus("all");
        }}
      />

      {reportQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : reportQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao gerar relatório</CardTitle>
            <CardDescription>Não foi possível carregar a distribuição por graduação no momento.</CardDescription>
          </CardHeader>
        </Card>
      ) : !items.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum resultado encontrado</CardTitle>
            <CardDescription>Ajuste os filtros para ampliar o recorte do relatório.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Graduação</th>
                  <th className="px-4 py-3 font-medium">Hierarquia</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Ativos</th>
                  <th className="px-4 py-3 font-medium">Inativos</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={`${item.rank.id}-${item.rank.name}`} className="border-t border-slate-200/70">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{item.rank.name}</p>
                        <p className="text-xs text-slate-500">{item.rank.abbreviation ?? "Sem sigla"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{item.rank.hierarchy_level ?? "-"}</td>
                    <td className="px-4 py-4"><Badge variant="secondary">{item.total_officers}</Badge></td>
                    <td className="px-4 py-4"><Badge variant="success">{item.active_officers}</Badge></td>
                    <td className="px-4 py-4"><Badge variant="outline">{item.inactive_officers}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
