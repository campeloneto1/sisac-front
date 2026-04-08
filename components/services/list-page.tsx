"use client";

import Link from "next/link";
import { BriefcaseBusiness, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { useSubunit } from "@/contexts/subunit-context";
import { useCompanies } from "@/hooks/use-companies";
import { usePermissions } from "@/hooks/use-permissions";
import { useSectors } from "@/hooks/use-sectors";
import { useServiceTypes } from "@/hooks/use-service-types";
import { useServices } from "@/hooks/use-services";
import { useUsers } from "@/hooks/use-users";
import type { ServiceFilters, ServicePriority, ServiceStatus } from "@/types/service.type";
import { ServicesFilters } from "@/components/services/filters";
import { ServicesTable } from "@/components/services/table";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export function ServicesListPage() {
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("services");
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState("all");
  const [serviceTypeId, setServiceTypeId] = useState("all");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [requestedBy, setRequestedBy] = useState("all");
  const [sectorId, setSectorId] = useState("all");
  const [scheduledDateFrom, setScheduledDateFrom] = useState("");
  const [scheduledDateTo, setScheduledDateTo] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo<ServiceFilters>(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      company_id: companyId !== "all" ? Number(companyId) : null,
      service_type_id: serviceTypeId !== "all" ? Number(serviceTypeId) : null,
      status: status !== "all" ? (status as ServiceStatus) : null,
      priority: priority !== "all" ? (priority as ServicePriority) : null,
      requested_by: requestedBy !== "all" ? Number(requestedBy) : null,
      sector_id: sectorId !== "all" ? Number(sectorId) : null,
      scheduled_date_from: scheduledDateFrom || undefined,
      scheduled_date_to: scheduledDateTo || undefined,
    }),
    [
      companyId,
      page,
      priority,
      requestedBy,
      scheduledDateFrom,
      scheduledDateTo,
      search,
      sectorId,
      serviceTypeId,
      status,
    ],
  );

  const isEnabled = Boolean(activeSubunit) && permissions.canViewAny;
  const servicesQuery = useServices(filters, isEnabled);
  const companiesQuery = useCompanies({ per_page: 100 }, isEnabled);
  const serviceTypesQuery = useServiceTypes({ per_page: 100 });
  const usersQuery = useUsers({ per_page: 100 });
  const sectorsQuery = useSectors({ per_page: 100 }, isEnabled);

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `viewAny` para visualizar serviços.
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
          <CardDescription>
            O módulo de serviços depende da subunidade ativa para enviar `X-Active-Subunit`.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">Serviços</h1>
            <p className="text-sm text-slate-500">
              Gerencie solicitacoes, agendamentos e execução de serviços da subunidade ativa.
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
              Contexto ativo: {activeSubunit.name}
            </p>
          </div>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/services/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo serviço
            </Link>
          </Button>
        ) : null}
      </div>

      <ServicesFilters
        search={search}
        companyId={companyId}
        serviceTypeId={serviceTypeId}
        status={status}
        priority={priority}
        requestedBy={requestedBy}
        sectorId={sectorId}
        scheduledDateFrom={scheduledDateFrom}
        scheduledDateTo={scheduledDateTo}
        companies={companiesQuery.data?.data ?? []}
        serviceTypes={serviceTypesQuery.data?.data ?? []}
        users={usersQuery.data?.data ?? []}
        sectors={sectorsQuery.data?.data ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onCompanyChange={(value) => {
          setCompanyId(value);
          setPage(1);
        }}
        onServiceTypeChange={(value) => {
          setServiceTypeId(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onPriorityChange={(value) => {
          setPriority(value);
          setPage(1);
        }}
        onRequestedByChange={(value) => {
          setRequestedBy(value);
          setPage(1);
        }}
        onSectorChange={(value) => {
          setSectorId(value);
          setPage(1);
        }}
        onScheduledDateFromChange={(value) => {
          setScheduledDateFrom(value);
          setPage(1);
        }}
        onScheduledDateToChange={(value) => {
          setScheduledDateTo(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setCompanyId("all");
          setServiceTypeId("all");
          setStatus("all");
          setPriority("all");
          setRequestedBy("all");
          setSectorId("all");
          setScheduledDateFrom("");
          setScheduledDateTo("");
          setPage(1);
        }}
      />

      {servicesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : servicesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar serviços</CardTitle>
            <CardDescription>
              Verifique a API, a subunidade ativa e as permissões do usuário autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !servicesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum serviço encontrado</CardTitle>
            <CardDescription>
              Crie um novo serviço ou refine os filtros aplicados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <ServicesTable services={servicesQuery.data.data} />
          <Pagination
            currentPage={servicesQuery.data.meta.current_page}
            lastPage={servicesQuery.data.meta.last_page}
            total={servicesQuery.data.meta.total}
            from={servicesQuery.data.meta.from}
            to={servicesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={servicesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
