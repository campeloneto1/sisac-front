"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficerLeaves } from "@/hooks/use-police-officer-leaves";
import { usePoliceOfficers } from "@/hooks/use-police-officers";
import { useLeaveTypes } from "@/hooks/use-leave-types";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { PoliceOfficerLeavesFilters } from "@/components/police-officer-leaves/filters";
import { PoliceOfficerLeavesTable } from "@/components/police-officer-leaves/table";

export function PoliceOfficerLeavesListPage() {
  const permissions = usePermissions("police-officer-leaves");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [policeOfficerId, setPoliceOfficerId] = useState("all");
  const [leaveTypeId, setLeaveTypeId] = useState("all");
  const [startDateFrom, setStartDateFrom] = useState("");
  const [startDateTo, setStartDateTo] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      status: status !== "all" ? status : undefined,
      police_officer_id: policeOfficerId !== "all" ? Number(policeOfficerId) : null,
      leave_type_id: leaveTypeId !== "all" ? Number(leaveTypeId) : null,
      start_date_from: startDateFrom || undefined,
      start_date_to: startDateTo || undefined,
    }),
    [leaveTypeId, page, policeOfficerId, search, startDateFrom, startDateTo, status],
  );

  const policeOfficerLeavesQuery = usePoliceOfficerLeaves(filters);
  const policeOfficersQuery = usePoliceOfficers({ per_page: 100 });
  const leaveTypesQuery = useLeaveTypes({ per_page: 100 });

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa da permissao `viewAny` para visualizar afastamentos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Afastamentos</h1>
          <p className="text-sm text-slate-500">Gerencie os afastamentos dos policiais com acompanhamento de tipo, periodo, status e COPEM.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/police-officer-leaves/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo afastamento
            </Link>
          </Button>
        ) : null}
      </div>

      <PoliceOfficerLeavesFilters
        search={search}
        status={status}
        policeOfficerId={policeOfficerId}
        leaveTypeId={leaveTypeId}
        startDateFrom={startDateFrom}
        startDateTo={startDateTo}
        policeOfficers={policeOfficersQuery.data?.data ?? []}
        leaveTypes={leaveTypesQuery.data?.data ?? []}
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
        onLeaveTypeChange={(value) => {
          setLeaveTypeId(value);
          setPage(1);
        }}
        onStartDateFromChange={(value) => {
          setStartDateFrom(value);
          setPage(1);
        }}
        onStartDateToChange={(value) => {
          setStartDateTo(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setStatus("all");
          setPoliceOfficerId("all");
          setLeaveTypeId("all");
          setStartDateFrom("");
          setStartDateTo("");
          setPage(1);
        }}
      />

      {policeOfficerLeavesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : policeOfficerLeavesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar afastamentos</CardTitle>
            <CardDescription>Verifique a API e as permissoes do usuario autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !policeOfficerLeavesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum afastamento encontrado</CardTitle>
            <CardDescription>Crie um novo afastamento ou refine os filtros aplicados.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <PoliceOfficerLeavesTable policeOfficerLeaves={policeOfficerLeavesQuery.data.data} />
          <Pagination
            currentPage={policeOfficerLeavesQuery.data.meta.current_page}
            lastPage={policeOfficerLeavesQuery.data.meta.last_page}
            total={policeOfficerLeavesQuery.data.meta.total}
            from={policeOfficerLeavesQuery.data.meta.from}
            to={policeOfficerLeavesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={policeOfficerLeavesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
