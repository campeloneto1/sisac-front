"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import {
  useServiceByTypeReport,
  useServiceCompletedReport,
  useServiceCostSummaryReport,
  useServiceOperationalBacklogReport,
  useServicePanelReport,
  useServicePriorityOverviewReport,
  useServiceStatusChangesReport,
  useServiceStatusOverviewReport,
} from "@/hooks/use-service-reports";
import type { ServiceReportFilters } from "@/types/service-report.type";
import { getServicePriorityVariant, getServiceStatusVariant } from "@/types/service.type";
import {
  ClearFiltersButton,
  CompanySelect,
  ContractSelect,
  CurrencyField,
  DateField,
  EmptyCard,
  ErrorCard,
  FiltersGrid,
  formatCurrency,
  formatDate,
  formatDateTime,
  LoadingCardList,
  Pager,
  PrioritySelect,
  RatingSelect,
  SearchField,
  SectorSelect,
  ServiceReportShell,
  ServiceReportsGuard,
  ServiceSelect,
  ServiceTypeSelect,
  StatusSelect,
  SummaryMetric,
  TableWrap,
  UserSelect,
  YesNoSelect,
  useServiceReportsAccess,
} from "@/components/service-reports/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function useBaseFilters() {
  const [search, setSearch] = useState("");
  const [serviceId, setServiceId] = useState("all");
  const [companyId, setCompanyId] = useState("all");
  const [serviceTypeId, setServiceTypeId] = useState("all");
  const [contractId, setContractId] = useState("all");
  const [requesterId, setRequesterId] = useState("all");
  const [sectorId, setSectorId] = useState("all");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");

  const filters = useMemo<ServiceReportFilters>(() => ({
    search: search || undefined,
    service_id: serviceId !== "all" ? Number(serviceId) : undefined,
    company_id: companyId !== "all" ? Number(companyId) : undefined,
    service_type_id: serviceTypeId !== "all" ? Number(serviceTypeId) : undefined,
    contract_id: contractId !== "all" ? Number(contractId) : undefined,
    requested_by: requesterId !== "all" ? Number(requesterId) : undefined,
    sector_id: sectorId !== "all" ? Number(sectorId) : undefined,
    status: status !== "all" ? (status as ServiceReportFilters["status"]) : undefined,
    priority: priority !== "all" ? (priority as ServiceReportFilters["priority"]) : undefined,
  }), [companyId, contractId, priority, requesterId, search, sectorId, serviceId, serviceTypeId, status]);

  return {
    search, serviceId, companyId, serviceTypeId, contractId, requesterId, sectorId, status, priority,
    setSearch, setServiceId, setCompanyId, setServiceTypeId, setContractId, setRequesterId, setSectorId, setStatus, setPriority,
    filters,
    clear() {
      setSearch(""); setServiceId("all"); setCompanyId("all"); setServiceTypeId("all"); setContractId("all"); setRequesterId("all"); setSectorId("all"); setStatus("all"); setPriority("all");
    },
  };
}

export function ServiceStatusOverviewReportPage() {
  const access = useServiceReportsAccess();
  const state = useBaseFilters();
  const query = useServiceStatusOverviewReport(state.filters, access.enabled);

  return (
    <ServiceReportsGuard>
      <ServiceReportShell title="Serviços por status" description="Distribuição consolidada dos serviços por status com visão financeira associada.">
        <FiltersGrid>
          <SearchField value={state.search} onChange={state.setSearch} />
          <CompanySelect value={state.companyId} onChange={state.setCompanyId} />
          <ServiceTypeSelect value={state.serviceTypeId} onChange={state.setServiceTypeId} />
          <SectorSelect value={state.sectorId} onChange={state.setSectorId} />
          <StatusSelect value={state.status} onChange={state.setStatus} />
          <ClearFiltersButton onClick={state.clear} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar o resumo por status." /> : !query.data?.data.length ? <EmptyCard text="Nenhum agrupamento encontrado." /> : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {query.data.data.map((item) => <SummaryMetric key={item.status.value} label={item.status.label} value={`${item.total_services}`} />)}
            </div>
            <TableWrap headers={["Status", "Total", "Estimado", "Real"]}>
              {query.data.data.map((item) => <tr key={item.status.value} className="border-t border-slate-200/70"><td className="px-4 py-4"><Badge variant={getServiceStatusVariant(item.status.value)}>{item.status.label}</Badge></td><td className="px-4 py-4 text-slate-700">{item.total_services}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.estimated_cost)}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.actual_cost)}</td></tr>)}
            </TableWrap>
          </div>
        )}
      </ServiceReportShell>
    </ServiceReportsGuard>
  );
}

export function ServicePriorityOverviewReportPage() {
  const access = useServiceReportsAccess();
  const state = useBaseFilters();
  const query = useServicePriorityOverviewReport(state.filters, access.enabled);

  return (
    <ServiceReportsGuard>
      <ServiceReportShell title="Serviços por prioridade" description="Visão agregada da demanda por prioridade, incluindo serviços ainda em aberto.">
        <FiltersGrid>
          <SearchField value={state.search} onChange={state.setSearch} />
          <CompanySelect value={state.companyId} onChange={state.setCompanyId} />
          <ServiceTypeSelect value={state.serviceTypeId} onChange={state.setServiceTypeId} />
          <SectorSelect value={state.sectorId} onChange={state.setSectorId} />
          <PrioritySelect value={state.priority} onChange={state.setPriority} />
          <ClearFiltersButton onClick={state.clear} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar o resumo por prioridade." /> : !query.data?.data.length ? <EmptyCard text="Nenhum agrupamento encontrado." /> : (
          <TableWrap headers={["Prioridade", "Total", "Em aberto"]}>
            {query.data.data.map((item, index) => {
              const label = item.priority?.label ?? item.fallback_label ?? `Sem prioridade ${index + 1}`;
              return <tr key={`${label}-${index}`} className="border-t border-slate-200/70"><td className="px-4 py-4">{item.priority ? <Badge variant={getServicePriorityVariant(item.priority.value)}>{label}</Badge> : <span className="text-slate-700">{label}</span>}</td><td className="px-4 py-4 text-slate-700">{item.total_services}</td><td className="px-4 py-4 text-slate-700">{item.open_services}</td></tr>;
            })}
          </TableWrap>
        )}
      </ServiceReportShell>
    </ServiceReportsGuard>
  );
}

export function ServiceByTypeReportPage() {
  const access = useServiceReportsAccess();
  const state = useBaseFilters();
  const query = useServiceByTypeReport(state.filters, access.enabled);

  return (
    <ServiceReportsGuard>
      <ServiceReportShell title="Serviços por tipo" description="Comparativo por tipo de serviço com produtividade e custos associados.">
        <FiltersGrid>
          <SearchField value={state.search} onChange={state.setSearch} />
          <CompanySelect value={state.companyId} onChange={state.setCompanyId} />
          <ServiceTypeSelect value={state.serviceTypeId} onChange={state.setServiceTypeId} />
          <SectorSelect value={state.sectorId} onChange={state.setSectorId} />
          <StatusSelect value={state.status} onChange={state.setStatus} />
          <ClearFiltersButton onClick={state.clear} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar o relatório por tipo." /> : !query.data?.data.length ? <EmptyCard text="Nenhum tipo encontrado." /> : (
          <TableWrap headers={["Tipo", "Total", "Concluídos", "Cancelados", "Estimado", "Real"]}>
            {query.data.data.map((item) => <tr key={item.service_type.id} className="border-t border-slate-200/70"><td className="px-4 py-4 font-medium text-slate-900">{item.service_type.name}</td><td className="px-4 py-4 text-slate-700">{item.total_services}</td><td className="px-4 py-4 text-slate-700">{item.completed_services}</td><td className="px-4 py-4 text-slate-700">{item.cancelled_services}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.estimated_cost)}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.actual_cost)}</td></tr>)}
          </TableWrap>
        )}
      </ServiceReportShell>
    </ServiceReportsGuard>
  );
}

export function ServiceOperationalBacklogReportPage() {
  return <ServiceSummaryPage mode="backlog" title="Backlog operacional" description="Fila operacional dos serviços ainda não concluídos, com foco em planejamento e atraso." />;
}

export function ServiceCompletedReportPage() {
  const access = useServiceReportsAccess();
  const state = useBaseFilters();
  const [rating, setRating] = useState("all");
  const [finishedFrom, setFinishedFrom] = useState("");
  const [finishedTo, setFinishedTo] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo<ServiceReportFilters>(() => ({
    ...state.filters,
    page,
    per_page: 15,
    rating: rating !== "all" ? Number(rating) : undefined,
    finished_from: finishedFrom || undefined,
    finished_to: finishedTo || undefined,
  }), [finishedFrom, finishedTo, page, rating, state.filters]);

  const query = useServiceCompletedReport(filters, access.enabled);

  return (
    <ServiceReportsGuard>
      <ServiceReportShell title="Serviços concluídos" description="Serviços finalizados com observações de término e avaliação do atendimento.">
        <FiltersGrid>
          <SearchField value={state.search} onChange={(value) => { state.setSearch(value); setPage(1); }} />
          <CompanySelect value={state.companyId} onChange={(value) => { state.setCompanyId(value); setPage(1); }} />
          <ServiceTypeSelect value={state.serviceTypeId} onChange={(value) => { state.setServiceTypeId(value); setPage(1); }} />
          <SectorSelect value={state.sectorId} onChange={(value) => { state.setSectorId(value); setPage(1); }} />
          <RatingSelect value={rating} onChange={(value) => { setRating(value); setPage(1); }} />
          <DateField label="Concluído de" value={finishedFrom} onChange={(value) => { setFinishedFrom(value); setPage(1); }} />
          <DateField label="Concluído até" value={finishedTo} onChange={(value) => { setFinishedTo(value); setPage(1); }} />
          <ClearFiltersButton onClick={() => { state.clear(); setRating("all"); setFinishedFrom(""); setFinishedTo(""); setPage(1); }} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar os serviços concluídos." /> : !query.data?.data.length ? <EmptyCard text="Nenhum serviço concluído encontrado." /> : (
          <div className="space-y-4">
            <TableWrap headers={["Serviço", "Empresa", "Conclusão", "Avaliação", "Obs. término", "Painel"]}>
              {query.data.data.map((item) => <tr key={item.service.id} className="border-t border-slate-200/70"><td className="px-4 py-4 font-medium text-slate-900">{item.service.request_description || `Serviço #${item.service.id}`}</td><td className="px-4 py-4 text-slate-700">{item.service.company?.name ?? "-"}</td><td className="px-4 py-4 text-slate-700">{formatDateTime(item.service.finished_at)}</td><td className="px-4 py-4 text-slate-700">{item.service.rating ? `${item.service.rating}/5` : "-"}</td><td className="px-4 py-4 text-slate-700">{item.finish_observations || "-"}</td><td className="px-4 py-4"><Button asChild size="sm" variant="outline"><Link href={`/service-reports/service-panel/${item.service.id}`}>Abrir</Link></Button></td></tr>)}
            </TableWrap>
            <Pager data={query.data} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </ServiceReportShell>
    </ServiceReportsGuard>
  );
}

function ServiceSummaryPage({ mode, title, description }: { mode: "backlog"; title: string; description: string }) {
  const access = useServiceReportsAccess();
  const state = useBaseFilters();
  const [scheduledFrom, setScheduledFrom] = useState("");
  const [scheduledTo, setScheduledTo] = useState("");
  const [onlyOverdue, setOnlyOverdue] = useState("all");
  const [page, setPage] = useState(1);

  const filters = useMemo<ServiceReportFilters>(() => ({
    ...state.filters,
    page,
    per_page: 15,
    scheduled_from: scheduledFrom || undefined,
    scheduled_to: scheduledTo || undefined,
    only_overdue: onlyOverdue === "yes" ? true : undefined,
  }), [onlyOverdue, page, scheduledFrom, scheduledTo, state.filters]);

  const query = useServiceOperationalBacklogReport(filters, access.enabled && mode === "backlog");

  return (
    <ServiceReportsGuard>
      <ServiceReportShell title={title} description={description}>
        <FiltersGrid>
          <SearchField value={state.search} onChange={(value) => { state.setSearch(value); setPage(1); }} />
          <ServiceSelect value={state.serviceId} onChange={(value) => { state.setServiceId(value); setPage(1); }} />
          <CompanySelect value={state.companyId} onChange={(value) => { state.setCompanyId(value); setPage(1); }} />
          <ServiceTypeSelect value={state.serviceTypeId} onChange={(value) => { state.setServiceTypeId(value); setPage(1); }} />
          <ContractSelect value={state.contractId} onChange={(value) => { state.setContractId(value); setPage(1); }} />
          <UserSelect value={state.requesterId} onChange={(value) => { state.setRequesterId(value); setPage(1); }} placeholder="Solicitante" />
          <SectorSelect value={state.sectorId} onChange={(value) => { state.setSectorId(value); setPage(1); }} />
          <StatusSelect value={state.status} onChange={(value) => { state.setStatus(value); setPage(1); }} />
          <PrioritySelect value={state.priority} onChange={(value) => { state.setPriority(value); setPage(1); }} />
          <DateField label="Agendado de" value={scheduledFrom} onChange={(value) => { setScheduledFrom(value); setPage(1); }} />
          <DateField label="Agendado até" value={scheduledTo} onChange={(value) => { setScheduledTo(value); setPage(1); }} />
          <YesNoSelect value={onlyOverdue} onChange={(value) => { setOnlyOverdue(value); setPage(1); }} placeholder="Apenas atrasados" allLabel="Todos os serviços" yesLabel="Só atrasados" noLabel="Não atrasados" />
          <ClearFiltersButton onClick={() => { state.clear(); setScheduledFrom(""); setScheduledTo(""); setOnlyOverdue("all"); setPage(1); }} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar o backlog operacional." /> : !query.data?.data.length ? <EmptyCard text="Nenhum serviço encontrado." /> : (
          <div className="space-y-4">
            <TableWrap headers={["Serviço", "Empresa", "Tipo", "Setor", "Status", "Prioridade", "Agendado", "Painel"]}>
              {query.data.data.map((item) => <tr key={item.id} className="border-t border-slate-200/70"><td className="px-4 py-4 font-medium text-slate-900">{item.request_description || `Serviço #${item.id}`}</td><td className="px-4 py-4 text-slate-700">{item.company?.name ?? "-"}</td><td className="px-4 py-4 text-slate-700">{item.service_type?.name ?? "-"}</td><td className="px-4 py-4 text-slate-700">{item.sector?.abbreviation || item.sector?.name || "-"}</td><td className="px-4 py-4">{item.status ? <Badge variant={getServiceStatusVariant(item.status.value)}>{item.status.label}</Badge> : "-"}</td><td className="px-4 py-4">{item.priority ? <Badge variant={getServicePriorityVariant(item.priority.value)}>{item.priority.label}</Badge> : "-"}</td><td className="px-4 py-4 text-slate-700">{formatDate(item.scheduled_date)}</td><td className="px-4 py-4"><Button asChild size="sm" variant="outline"><Link href={`/service-reports/service-panel/${item.id}`}>Abrir</Link></Button></td></tr>)}
            </TableWrap>
            <Pager data={query.data} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </ServiceReportShell>
    </ServiceReportsGuard>
  );
}

export function ServiceCostSummaryReportPage() {
  const access = useServiceReportsAccess();
  const state = useBaseFilters();
  const [minEstimated, setMinEstimated] = useState("");
  const [maxEstimated, setMaxEstimated] = useState("");
  const [minActual, setMinActual] = useState("");
  const [maxActual, setMaxActual] = useState("");
  const filters = useMemo<ServiceReportFilters>(() => ({
    ...state.filters,
    min_estimated_cost: minEstimated ? Number(minEstimated) : undefined,
    max_estimated_cost: maxEstimated ? Number(maxEstimated) : undefined,
    min_actual_cost: minActual ? Number(minActual) : undefined,
    max_actual_cost: maxActual ? Number(maxActual) : undefined,
  }), [maxActual, maxEstimated, minActual, minEstimated, state.filters]);
  const query = useServiceCostSummaryReport(filters, access.enabled);

  return (
    <ServiceReportsGuard>
      <ServiceReportShell title="Resumo de custos" description="Consolidação financeira dos serviços agrupada por empresa.">
        <FiltersGrid>
          <SearchField value={state.search} onChange={state.setSearch} />
          <CompanySelect value={state.companyId} onChange={state.setCompanyId} />
          <ServiceTypeSelect value={state.serviceTypeId} onChange={state.setServiceTypeId} />
          <SectorSelect value={state.sectorId} onChange={state.setSectorId} />
          <CurrencyField label="Estimado mínimo" value={minEstimated} onChange={setMinEstimated} />
          <CurrencyField label="Estimado máximo" value={maxEstimated} onChange={setMaxEstimated} />
          <CurrencyField label="Real mínimo" value={minActual} onChange={setMinActual} />
          <CurrencyField label="Real máximo" value={maxActual} onChange={setMaxActual} />
          <ClearFiltersButton onClick={() => { state.clear(); setMinEstimated(""); setMaxEstimated(""); setMinActual(""); setMaxActual(""); }} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar o resumo de custos." /> : !query.data?.data.length ? <EmptyCard text="Nenhum agrupamento encontrado." /> : (
          <TableWrap headers={["Empresa", "Serviços", "Estimado", "Real", "Média estimada", "Média real"]}>
            {query.data.data.map((item) => <tr key={item.company.id} className="border-t border-slate-200/70"><td className="px-4 py-4 font-medium text-slate-900">{item.company.name}</td><td className="px-4 py-4 text-slate-700">{item.total_services}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.estimated_cost)}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.actual_cost)}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.average_estimated_cost)}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.average_actual_cost)}</td></tr>)}
          </TableWrap>
        )}
      </ServiceReportShell>
    </ServiceReportsGuard>
  );
}

export function ServiceStatusChangesReportPage() {
  const access = useServiceReportsAccess();
  const state = useBaseFilters();
  const [fromStatus, setFromStatus] = useState("all");
  const [toStatus, setToStatus] = useState("all");
  const [changedBy, setChangedBy] = useState("all");
  const [changedFrom, setChangedFrom] = useState("");
  const [changedTo, setChangedTo] = useState("");
  const [page, setPage] = useState(1);
  const filters = useMemo<ServiceReportFilters>(() => ({
    ...state.filters,
    page,
    per_page: 15,
    from_status: fromStatus !== "all" ? (fromStatus as ServiceReportFilters["from_status"]) : undefined,
    to_status: toStatus !== "all" ? (toStatus as ServiceReportFilters["to_status"]) : undefined,
    changed_by: changedBy !== "all" ? Number(changedBy) : undefined,
    changed_from: changedFrom || undefined,
    changed_to: changedTo || undefined,
  }), [changedBy, changedFrom, changedTo, fromStatus, page, state.filters, toStatus]);
  const query = useServiceStatusChangesReport(filters, access.enabled);

  return (
    <ServiceReportsGuard>
      <ServiceReportShell title="Mudanças de status" description="Trilha das transições de status com usuário responsável e observações registradas.">
        <FiltersGrid>
          <SearchField value={state.search} onChange={(value) => { state.setSearch(value); setPage(1); }} />
          <ServiceSelect value={state.serviceId} onChange={(value) => { state.setServiceId(value); setPage(1); }} />
          <CompanySelect value={state.companyId} onChange={(value) => { state.setCompanyId(value); setPage(1); }} />
          <ServiceTypeSelect value={state.serviceTypeId} onChange={(value) => { state.setServiceTypeId(value); setPage(1); }} />
          <UserSelect value={changedBy} onChange={(value) => { setChangedBy(value); setPage(1); }} placeholder="Alterado por" />
          <StatusSelect value={fromStatus} onChange={(value) => { setFromStatus(value); setPage(1); }} placeholder="Status origem" />
          <StatusSelect value={toStatus} onChange={(value) => { setToStatus(value); setPage(1); }} placeholder="Status destino" />
          <DateField label="Mudou de" value={changedFrom} onChange={(value) => { setChangedFrom(value); setPage(1); }} />
          <DateField label="Mudou até" value={changedTo} onChange={(value) => { setChangedTo(value); setPage(1); }} />
          <ClearFiltersButton onClick={() => { state.clear(); setFromStatus("all"); setToStatus("all"); setChangedBy("all"); setChangedFrom(""); setChangedTo(""); setPage(1); }} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar o histórico de mudanças." /> : !query.data?.data.length ? <EmptyCard text="Nenhuma mudança de status encontrada." /> : (
          <div className="space-y-4">
            <TableWrap headers={["Serviço", "Origem", "Destino", "Alterado por", "Quando", "Observações"]}>
              {query.data.data.map((item) => <tr key={item.id} className="border-t border-slate-200/70"><td className="px-4 py-4 font-medium text-slate-900">{item.service?.request_description || `Serviço #${item.service_id}`}</td><td className="px-4 py-4">{item.from_status ? <Badge variant={getServiceStatusVariant(item.from_status.value)}>{item.from_status.label}</Badge> : "-"}</td><td className="px-4 py-4">{item.to_status ? <Badge variant={getServiceStatusVariant(item.to_status.value)}>{item.to_status.label}</Badge> : "-"}</td><td className="px-4 py-4 text-slate-700">{item.changed_by?.name ?? "-"}</td><td className="px-4 py-4 text-slate-700">{formatDateTime(item.changed_at)}</td><td className="px-4 py-4 text-slate-700">{item.notes || "-"}</td></tr>)}
            </TableWrap>
            <Pager data={query.data} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </ServiceReportShell>
    </ServiceReportsGuard>
  );
}

export function ServicePanelReportPage() {
  const { id } = useParams<{ id: string }>();
  const access = useServiceReportsAccess(true);
  const query = useServicePanelReport(id, access.enabled);

  return (
    <ServiceReportsGuard requireView>
      <ServiceReportShell title="Painel consolidado do serviço" description="Visão consolidada do serviço com resumo financeiro e trilha de mudanças de status." href={`/services/${id}`}>
        {query.isLoading ? <LoadingCardList /> : query.isError || !query.data?.data ? <ErrorCard text="Não foi possível carregar o painel do serviço." /> : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryMetric label="Mudanças de status" value={String(query.data.data.summary.total_status_changes)} />
              <SummaryMetric label="Última mudança" value={formatDateTime(query.data.data.summary.latest_status_change_at)} />
              <SummaryMetric label="Custo estimado" value={formatCurrency(query.data.data.summary.estimated_cost)} />
              <SummaryMetric label="Custo real" value={formatCurrency(query.data.data.summary.actual_cost)} />
            </div>
            <TableWrap headers={["Serviço", "Empresa", "Tipo", "Status", "Prioridade", "Avaliação"]}>
              <tr className="border-t border-slate-200/70">
                <td className="px-4 py-4 font-medium text-slate-900">{query.data.data.service.request_description || `Serviço #${query.data.data.service.id}`}</td>
                <td className="px-4 py-4 text-slate-700">{query.data.data.service.company?.name ?? "-"}</td>
                <td className="px-4 py-4 text-slate-700">{query.data.data.service.service_type?.name ?? "-"}</td>
                <td className="px-4 py-4">{query.data.data.service.status ? <Badge variant={getServiceStatusVariant(query.data.data.service.status.value)}>{query.data.data.service.status.label}</Badge> : "-"}</td>
                <td className="px-4 py-4">{query.data.data.service.priority ? <Badge variant={getServicePriorityVariant(query.data.data.service.priority.value)}>{query.data.data.service.priority.label}</Badge> : "-"}</td>
                <td className="px-4 py-4 text-slate-700">{query.data.data.summary.rating ? `${query.data.data.summary.rating}/5` : "-"}</td>
              </tr>
            </TableWrap>
            {!query.data.data.status_history.length ? <EmptyCard text="Nenhuma mudança de status registrada." /> : (
              <TableWrap headers={["Origem", "Destino", "Alterado por", "Quando", "Observações"]}>
                {query.data.data.status_history.map((item) => <tr key={item.id} className="border-t border-slate-200/70"><td className="px-4 py-4">{item.from_status ? <Badge variant={getServiceStatusVariant(item.from_status.value)}>{item.from_status.label}</Badge> : "-"}</td><td className="px-4 py-4">{item.to_status ? <Badge variant={getServiceStatusVariant(item.to_status.value)}>{item.to_status.label}</Badge> : "-"}</td><td className="px-4 py-4 text-slate-700">{item.changed_by?.name ?? "-"}</td><td className="px-4 py-4 text-slate-700">{formatDateTime(item.changed_at)}</td><td className="px-4 py-4 text-slate-700">{item.notes || "-"}</td></tr>)}
              </TableWrap>
            )}
          </div>
        )}
      </ServiceReportShell>
    </ServiceReportsGuard>
  );
}
