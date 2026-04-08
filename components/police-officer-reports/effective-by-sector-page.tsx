"use client";

import Link from "next/link";
import { ArrowLeft, Layers3 } from "lucide-react";
import { useMemo, useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficerEffectiveBySectorReport } from "@/hooks/use-police-officer-reports";
import { hasPermission } from "@/lib/permissions";
import type { PoliceOfficerReportFilters } from "@/types/police-officer-report.type";
import { PoliceOfficerAggregateFilters } from "@/components/police-officer-reports/aggregate-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PoliceOfficerEffectiveBySectorReportPage() {
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

  const reportQuery = usePoliceOfficerEffectiveBySectorReport(
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
          <CardDescription>Escolha uma subunidade ativa antes de gerar o relatório por setor.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const items = reportQuery.data?.data ?? [];
  const totals = items.reduce(
    (accumulator, item) => ({
      sectors: accumulator.sectors + 1,
      officers: accumulator.officers + item.total_officers,
      active: accumulator.active + item.active_officers,
      inactive: accumulator.inactive + item.inactive_officers,
    }),
    { sectors: 0, officers: 0, active: 0, inactive: 0 },
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
              <Layers3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-slate-900">Efetivo por setor</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Leitura agregada do efetivo atual por setor, com distribuição por função e graduação dentro da subunidade ativa.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-200/70 bg-white/80"><CardHeader className="pb-2"><CardDescription>Setores</CardDescription><CardTitle>{totals.sectors}</CardTitle></CardHeader></Card>
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
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      ) : reportQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao gerar relatório</CardTitle>
            <CardDescription>Não foi possível carregar o efetivo por setor no momento.</CardDescription>
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
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={String(item.sector.id ?? item.sector.name)} className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle>{item.sector.name}</CardTitle>
                    <CardDescription>
                      {item.sector.abbreviation ? `${item.sector.abbreviation} • ` : ""}{item.total_officers} policial(is) no recorte atual
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Total: {item.total_officers}</Badge>
                    <Badge variant="success">Ativos: {item.active_officers}</Badge>
                    <Badge variant="outline">Inativos: {item.inactive_officers}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 xl:grid-cols-2">
                <div className="space-y-3 rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">Distribuição por função</p>
                  {item.assignments.length ? (
                    <div className="space-y-2">
                      {item.assignments.map((assignment) => (
                        <div key={`${item.sector.id}-${assignment.id}-${assignment.name}`} className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white px-3 py-2">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{assignment.name}</p>
                            <p className="text-xs text-slate-500">{assignment.category ?? "Sem categoria"}</p>
                          </div>
                          <Badge variant="outline">{assignment.total_officers}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Sem distribuição por função para este recorte.</p>
                  )}
                </div>

                <div className="space-y-3 rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">Distribuição por graduação</p>
                  {item.ranks.length ? (
                    <div className="space-y-2">
                      {item.ranks.map((rank) => (
                        <div key={`${item.sector.id}-${rank.id}-${rank.name}`} className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white px-3 py-2">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{rank.name}</p>
                            <p className="text-xs text-slate-500">{rank.abbreviation ?? "Sem sigla"}</p>
                          </div>
                          <Badge variant="outline">{rank.total_officers}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Sem distribuição por graduação para este recorte.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
