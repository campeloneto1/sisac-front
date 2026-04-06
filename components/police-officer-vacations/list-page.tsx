"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficerVacations } from "@/hooks/use-police-officer-vacations";
import { usePoliceOfficers } from "@/hooks/use-police-officers";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { PoliceOfficerVacationsFilters } from "@/components/police-officer-vacations/filters";
import { PoliceOfficerVacationsTable } from "@/components/police-officer-vacations/table";

export function PoliceOfficerVacationsListPage() {
  const permissions = usePermissions("police-officer-vacations");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [policeOfficerId, setPoliceOfficerId] = useState("all");
  const [referenceYear, setReferenceYear] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      status: status !== "all" ? status : undefined,
      police_officer_id: policeOfficerId !== "all" ? Number(policeOfficerId) : null,
      reference_year: referenceYear ? Number(referenceYear) : null,
    }),
    [page, policeOfficerId, referenceYear, search, status],
  );

  const vacationsQuery = usePoliceOfficerVacations(filters);
  const policeOfficersQuery = usePoliceOfficers({ per_page: 100 });

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa da permissao `viewAny` para visualizar ferias.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Ferias</h1>
          <p className="text-sm text-slate-500">Gerencie o saldo anual de ferias dos policiais e o parcelamento em periodos de gozo.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/police-officer-vacations/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo registro
            </Link>
          </Button>
        ) : null}
      </div>

      <PoliceOfficerVacationsFilters
        search={search}
        status={status}
        policeOfficerId={policeOfficerId}
        referenceYear={referenceYear}
        policeOfficers={policeOfficersQuery.data?.data ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onPoliceOfficerChange={(value) => {
          setPoliceOfficerId(value);
          setPage(1);
        }}
        onReferenceYearChange={(value) => {
          setReferenceYear(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setStatus("all");
          setPoliceOfficerId("all");
          setReferenceYear("");
          setPage(1);
        }}
      />

      {vacationsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : vacationsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar ferias</CardTitle>
            <CardDescription>Verifique a API e as permissoes do usuario autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !vacationsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum registro encontrado</CardTitle>
            <CardDescription>Crie um novo registro anual de ferias ou refine os filtros aplicados.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <PoliceOfficerVacationsTable vacations={vacationsQuery.data.data} />
          <Pagination
            currentPage={vacationsQuery.data.meta.current_page}
            lastPage={vacationsQuery.data.meta.last_page}
            total={vacationsQuery.data.meta.total}
            from={vacationsQuery.data.meta.from}
            to={vacationsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={vacationsQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
