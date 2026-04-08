"use client";

import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficerActiveInactiveReport } from "@/hooks/use-police-officer-reports";
import { hasPermission } from "@/lib/permissions";
import type { PoliceOfficerReportFilters } from "@/types/police-officer-report.type";
import { PoliceOfficerActiveInactiveFilters } from "@/components/police-officer-reports/active-inactive-filters";
import { PoliceOfficerActiveInactiveTable } from "@/components/police-officer-reports/active-inactive-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export function PoliceOfficerActiveInactiveReportPage() {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("police-officers");
  const [search, setSearch] = useState("");
  const [cityId, setCityId] = useState("all");
  const [genderId, setGenderId] = useState("all");
  const [educationLevelId, setEducationLevelId] = useState("all");
  const [sectorId, setSectorId] = useState("all");
  const [assignmentId, setAssignmentId] = useState("all");
  const [rankId, setRankId] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [page, setPage] = useState(1);

  const filters = useMemo<PoliceOfficerReportFilters>(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      city_id: cityId !== "all" ? Number(cityId) : undefined,
      gender_id: genderId !== "all" ? Number(genderId) : undefined,
      education_level_id:
        educationLevelId !== "all" ? Number(educationLevelId) : undefined,
      sector_id: sectorId !== "all" ? Number(sectorId) : undefined,
      assignment_id: assignmentId !== "all" ? Number(assignmentId) : undefined,
      rank_id: rankId !== "all" ? Number(rankId) : undefined,
      is_active:
        activeStatus === "all"
          ? undefined
          : activeStatus === "active",
    }),
    [
      activeStatus,
      assignmentId,
      cityId,
      educationLevelId,
      genderId,
      page,
      rankId,
      search,
      sectorId,
    ],
  );

  const reportQuery = usePoliceOfficerActiveInactiveReport(
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
          <CardDescription>Escolha uma subunidade ativa antes de gerar o relatório de policiais.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const summary = reportQuery.data?.summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="ghost" className="px-2">
              <Link href="/police-officer-reports">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Relatórios
              </Link>
            </Button>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3 text-primary">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <h1 className="mt-3 font-display text-3xl text-slate-900">Ativos e inativos</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Relatório operacional do efetivo atual, com busca textual e recortes por setor, função, cidade, gênero, escolaridade e graduação.
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            Contexto ativo: {activeSubunit.name}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader className="pb-2">
            <CardDescription>Total filtrado</CardDescription>
            <CardTitle>{summary?.total ?? "-"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-500">
            Quantidade total de policiais retornados pelos filtros aplicados.
          </CardContent>
        </Card>
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader className="pb-2">
            <CardDescription>Ativos</CardDescription>
            <CardTitle>{summary?.active ?? "-"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-500">
            Policiais em situação ativa dentro do recorte atual.
          </CardContent>
        </Card>
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader className="pb-2">
            <CardDescription>Inativos</CardDescription>
            <CardTitle>{summary?.inactive ?? "-"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-500">
            Policiais inativos dentro do recorte atual.
          </CardContent>
        </Card>
      </div>

      <PoliceOfficerActiveInactiveFilters
        search={search}
        cityId={cityId}
        genderId={genderId}
        educationLevelId={educationLevelId}
        sectorId={sectorId}
        assignmentId={assignmentId}
        rankId={rankId}
        activeStatus={activeStatus}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onCityChange={(value) => {
          setCityId(value);
          setPage(1);
        }}
        onGenderChange={(value) => {
          setGenderId(value);
          setPage(1);
        }}
        onEducationLevelChange={(value) => {
          setEducationLevelId(value);
          setPage(1);
        }}
        onSectorChange={(value) => {
          setSectorId(value);
          setPage(1);
        }}
        onAssignmentChange={(value) => {
          setAssignmentId(value);
          setPage(1);
        }}
        onRankChange={(value) => {
          setRankId(value);
          setPage(1);
        }}
        onActiveStatusChange={(value) => {
          setActiveStatus(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setCityId("all");
          setGenderId("all");
          setEducationLevelId("all");
          setSectorId("all");
          setAssignmentId("all");
          setRankId("all");
          setActiveStatus("all");
          setPage(1);
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
            <CardDescription>
              Verifique a API, a subunidade ativa e as permissões do usuário autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !reportQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum policial encontrado</CardTitle>
            <CardDescription>
              Ajuste os filtros para ampliar o recorte ou revise se existem registros na subunidade ativa.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <PoliceOfficerActiveInactiveTable officers={reportQuery.data.data} />
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
