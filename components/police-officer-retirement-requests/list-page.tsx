"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficerRetirementRequests } from "@/hooks/use-police-officer-retirement-requests";
import { usePoliceOfficers } from "@/hooks/use-police-officers";
import type { PoliceOfficerRetirementRequestStatus } from "@/types/police-officer-retirement-request.type";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { PoliceOfficerRetirementRequestsFilters } from "@/components/police-officer-retirement-requests/filters";
import { PoliceOfficerRetirementRequestsTable } from "@/components/police-officer-retirement-requests/table";

export function PoliceOfficerRetirementRequestsListPage() {
  const permissions = usePermissions("police-officer-retirement-requests");
  const [search, setSearch] = useState("");
  const [policeOfficerId, setPoliceOfficerId] = useState("all");
  const [status, setStatus] = useState("all");
  const [requestedAtFrom, setRequestedAtFrom] = useState("");
  const [requestedAtTo, setRequestedAtTo] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      police_officer_id:
        policeOfficerId !== "all" ? Number(policeOfficerId) : undefined,
      status:
        status !== "all"
          ? (status as PoliceOfficerRetirementRequestStatus)
          : undefined,
      requested_at_from: requestedAtFrom || undefined,
      requested_at_to: requestedAtTo || undefined,
    }),
    [page, policeOfficerId, requestedAtFrom, requestedAtTo, status, search],
  );

  const policeOfficerRetirementRequestsQuery =
    usePoliceOfficerRetirementRequests(filters);
  const policeOfficersQuery = usePoliceOfficers({ per_page: 100 });

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `viewAny` para visualizar requerimentos de
            aposentadoria.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            Requerimentos de aposentadoria
          </h1>
          <p className="text-sm text-slate-500">
            Gerencie os requerimentos de aposentadoria dos policiais.
          </p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/police-officer-retirement-requests/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo requerimento
            </Link>
          </Button>
        ) : null}
      </div>

      <PoliceOfficerRetirementRequestsFilters
        search={search}
        policeOfficerId={policeOfficerId}
        status={status}
        requestedAtFrom={requestedAtFrom}
        requestedAtTo={requestedAtTo}
        policeOfficers={policeOfficersQuery.data?.data ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onPoliceOfficerChange={(value) => {
          setPoliceOfficerId(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onRequestedAtFromChange={(value) => {
          setRequestedAtFrom(value);
          setPage(1);
        }}
        onRequestedAtToChange={(value) => {
          setRequestedAtTo(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setPoliceOfficerId("all");
          setStatus("all");
          setRequestedAtFrom("");
          setRequestedAtTo("");
          setPage(1);
        }}
      />

      {policeOfficerRetirementRequestsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : policeOfficerRetirementRequestsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar requerimentos</CardTitle>
            <CardDescription>
              Verifique a API e as permissoes do usuario autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !policeOfficerRetirementRequestsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum requerimento encontrado</CardTitle>
            <CardDescription>
              Crie um novo requerimento ou refine os filtros aplicados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <PoliceOfficerRetirementRequestsTable
            policeOfficerRetirementRequests={
              policeOfficerRetirementRequestsQuery.data.data
            }
          />
          <Pagination
            currentPage={
              policeOfficerRetirementRequestsQuery.data.meta.current_page
            }
            lastPage={policeOfficerRetirementRequestsQuery.data.meta.last_page}
            total={policeOfficerRetirementRequestsQuery.data.meta.total}
            from={policeOfficerRetirementRequestsQuery.data.meta.from}
            to={policeOfficerRetirementRequestsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={policeOfficerRetirementRequestsQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
