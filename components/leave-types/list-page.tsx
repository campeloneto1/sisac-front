"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useLeaveTypes } from "@/hooks/use-leave-types";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { LeaveTypesFilters } from "@/components/leave-types/filters";
import { LeaveTypesTable } from "@/components/leave-types/table";

type BooleanFilterValue = "all" | "true" | "false";

function mapBooleanFilter(value: BooleanFilterValue) {
  if (value === "all") {
    return undefined;
  }

  return value === "true";
}

export function LeaveTypesListPage() {
  const permissions = usePermissions("leave-types");
  const [search, setSearch] = useState("");
  const [requiresMedicalReport, setRequiresMedicalReport] = useState<BooleanFilterValue>("all");
  const [affectsSalary, setAffectsSalary] = useState<BooleanFilterValue>("all");
  const [page, setPage] = useState(1);
  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      requires_medical_report: mapBooleanFilter(requiresMedicalReport),
      affects_salary: mapBooleanFilter(affectsSalary),
    }),
    [affectsSalary, page, requiresMedicalReport, search],
  );
  const leaveTypesQuery = useLeaveTypes(filters);

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `viewAny` para visualizar tipos de afastamento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Tipos de afastamento</h1>
          <p className="text-sm text-slate-500">Gerencie os tipos administrativos usados no cadastro de afastamentos dos policiais.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/leave-types/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo tipo
            </Link>
          </Button>
        ) : null}
      </div>

      <LeaveTypesFilters
        search={search}
        requiresMedicalReport={requiresMedicalReport}
        affectsSalary={affectsSalary}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onRequiresMedicalReportChange={(value) => {
          setRequiresMedicalReport(value);
          setPage(1);
        }}
        onAffectsSalaryChange={(value) => {
          setAffectsSalary(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setRequiresMedicalReport("all");
          setAffectsSalary("all");
          setPage(1);
        }}
      />

      {leaveTypesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : leaveTypesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar tipos de afastamento</CardTitle>
            <CardDescription>Verifique a API e as permissões do usuário autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !leaveTypesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum tipo encontrado</CardTitle>
            <CardDescription>Crie um novo tipo de afastamento ou refine os filtros aplicados.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <LeaveTypesTable leaveTypes={leaveTypesQuery.data.data} />
          <Pagination
            currentPage={leaveTypesQuery.data.meta.current_page}
            lastPage={leaveTypesQuery.data.meta.last_page}
            total={leaveTypesQuery.data.meta.total}
            from={leaveTypesQuery.data.meta.from}
            to={leaveTypesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={leaveTypesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
