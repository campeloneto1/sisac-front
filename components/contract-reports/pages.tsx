"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import {
  useContractActiveReport,
  useContractAlertsReport,
  useContractExecutionOverviewReport,
  useContractExpiringReport,
  useContractPanelReport,
  useContractStatusChangesReport,
  useContractStatusOverviewReport,
  useContractTransactionsReport,
} from "@/hooks/use-contract-reports";
import type { ContractReportFilters } from "@/types/contract-report.type";
import { getContractAlertBadgeVariant, getContractAlertStatusLabel, getContractAlertTypeLabel } from "@/types/contract-alert.type";
import { getContractStatusBadgeVariant } from "@/types/contract.type";
import {
  AlertStatusSelect,
  AlertTypeSelect,
  ClearFiltersButton,
  CompanySelect,
  ContractObjectSelect,
  ContractReportShell,
  ContractReportsGuard,
  ContractSelect,
  ContractTypeSelect,
  DateField,
  EmptyCard,
  ErrorCard,
  FiltersGrid,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercent,
  LoadingCardList,
  NumberField,
  Pager,
  SearchField,
  StatusSelect,
  SummaryMetric,
  TableWrap,
  TransactionStatusSelect,
  TransactionTypeSelect,
  YesNoSelect,
  useContractReportsAccess,
} from "@/components/contract-reports/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function useBaseFilters() {
  const [search, setSearch] = useState("");
  const [contractId, setContractId] = useState("all");
  const [companyId, setCompanyId] = useState("all");
  const [contractTypeId, setContractTypeId] = useState("all");
  const [contractObjectId, setContractObjectId] = useState("all");
  const [status, setStatus] = useState("all");

  const filters = useMemo<ContractReportFilters>(() => ({
    search: search || undefined,
    contract_id: contractId !== "all" ? Number(contractId) : undefined,
    company_id: companyId !== "all" ? Number(companyId) : undefined,
    contract_type_id: contractTypeId !== "all" ? Number(contractTypeId) : undefined,
    contract_object_id: contractObjectId !== "all" ? Number(contractObjectId) : undefined,
    status: status !== "all" ? (status as ContractReportFilters["status"]) : undefined,
  }), [companyId, contractId, contractObjectId, contractTypeId, search, status]);

  return {
    search, contractId, companyId, contractTypeId, contractObjectId, status,
    setSearch, setContractId, setCompanyId, setContractTypeId, setContractObjectId, setStatus,
    filters,
    clear() {
      setSearch("");
      setContractId("all");
      setCompanyId("all");
      setContractTypeId("all");
      setContractObjectId("all");
      setStatus("all");
    },
  };
}

export function ContractStatusOverviewReportPage() {
  const access = useContractReportsAccess();
  const state = useBaseFilters();
  const query = useContractStatusOverviewReport(state.filters, access.enabled);

  return (
    <ContractReportsGuard>
      <ContractReportShell title="Contratos por status" description="Distribuição dos contratos por status com total contratado e executado.">
        <FiltersGrid>
          <SearchField value={state.search} onChange={state.setSearch} />
          <CompanySelect value={state.companyId} onChange={state.setCompanyId} />
          <ContractTypeSelect value={state.contractTypeId} onChange={state.setContractTypeId} />
          <ContractObjectSelect value={state.contractObjectId} onChange={state.setContractObjectId} />
          <StatusSelect value={state.status} onChange={state.setStatus} />
          <ClearFiltersButton onClick={state.clear} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar o resumo por status." /> : !query.data?.data.length ? <EmptyCard text="Nenhum agrupamento encontrado." /> : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {query.data.data.map((item) => <SummaryMetric key={item.status.value} label={item.status.label} value={String(item.total_contracts)} />)}
            </div>
            <TableWrap headers={["Status", "Contratos", "Valor total", "Executado"]}>
              {query.data.data.map((item) => <tr key={item.status.value} className="border-t border-slate-200/70"><td className="px-4 py-4"><Badge variant={getContractStatusBadgeVariant(item.status.value)}>{item.status.label}</Badge></td><td className="px-4 py-4 text-slate-700">{item.total_contracts}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.total_value)}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.executed_amount)}</td></tr>)}
            </TableWrap>
          </div>
        )}
      </ContractReportShell>
    </ContractReportsGuard>
  );
}

export function ContractExecutionOverviewReportPage() {
  const access = useContractReportsAccess();
  const state = useBaseFilters();
  const [minTotal, setMinTotal] = useState("");
  const [maxTotal, setMaxTotal] = useState("");
  const filters = useMemo<ContractReportFilters>(() => ({
    ...state.filters,
    min_total_value: minTotal ? Number(minTotal) : undefined,
    max_total_value: maxTotal ? Number(maxTotal) : undefined,
  }), [maxTotal, minTotal, state.filters]);
  const query = useContractExecutionOverviewReport(filters, access.enabled);

  return (
    <ContractReportsGuard>
      <ContractReportShell title="Execução financeira" description="Resumo de execução financeira dos contratos agrupado por empresa.">
        <FiltersGrid>
          <SearchField value={state.search} onChange={state.setSearch} />
          <CompanySelect value={state.companyId} onChange={state.setCompanyId} />
          <ContractTypeSelect value={state.contractTypeId} onChange={state.setContractTypeId} />
          <ContractObjectSelect value={state.contractObjectId} onChange={state.setContractObjectId} />
          <NumberField label="Valor mínimo" value={minTotal} onChange={setMinTotal} />
          <NumberField label="Valor máximo" value={maxTotal} onChange={setMaxTotal} />
          <ClearFiltersButton onClick={() => { state.clear(); setMinTotal(""); setMaxTotal(""); }} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar o resumo de execução." /> : !query.data?.data.length ? <EmptyCard text="Nenhum agrupamento encontrado." /> : (
          <TableWrap headers={["Empresa", "Contratos", "Valor total", "Executado", "Saldo", "% executado"]}>
            {query.data.data.map((item, index) => <tr key={`${item.company.id ?? "none"}-${index}`} className="border-t border-slate-200/70"><td className="px-4 py-4 font-medium text-slate-900">{item.company.name}</td><td className="px-4 py-4 text-slate-700">{item.total_contracts}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.total_value)}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.executed_amount)}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.remaining_amount)}</td><td className="px-4 py-4 text-slate-700">{formatPercent(item.executed_percentage)}</td></tr>)}
          </TableWrap>
        )}
      </ContractReportShell>
    </ContractReportsGuard>
  );
}

export function ContractActiveReportPage() {
  const access = useContractReportsAccess();
  const state = useBaseFilters();
  const [isActive, setIsActive] = useState("yes");
  const [startFrom, setStartFrom] = useState("");
  const [startTo, setStartTo] = useState("");
  const [endFrom, setEndFrom] = useState("");
  const [endTo, setEndTo] = useState("");
  const [page, setPage] = useState(1);
  const filters = useMemo<ContractReportFilters>(() => ({
    ...state.filters,
    page,
    per_page: 15,
    is_active: isActive === "yes" ? true : isActive === "no" ? false : undefined,
    start_from: startFrom || undefined,
    start_to: startTo || undefined,
    end_from: endFrom || undefined,
    end_to: endTo || undefined,
  }), [endFrom, endTo, isActive, page, startFrom, startTo, state.filters]);
  const query = useContractActiveReport(filters, access.enabled);

  return (
    <ContractReportsGuard>
      <ContractReportShell title="Contratos ativos" description="Listagem operacional dos contratos ativos com acompanhamento de execução e vigência.">
        <FiltersGrid>
          <SearchField value={state.search} onChange={(value) => { state.setSearch(value); setPage(1); }} />
          <ContractSelect value={state.contractId} onChange={(value) => { state.setContractId(value); setPage(1); }} />
          <CompanySelect value={state.companyId} onChange={(value) => { state.setCompanyId(value); setPage(1); }} />
          <ContractTypeSelect value={state.contractTypeId} onChange={(value) => { state.setContractTypeId(value); setPage(1); }} />
          <ContractObjectSelect value={state.contractObjectId} onChange={(value) => { state.setContractObjectId(value); setPage(1); }} />
          <YesNoSelect value={isActive} onChange={(value) => { setIsActive(value); setPage(1); }} placeholder="Ativo" allLabel="Todos" yesLabel="Ativos" noLabel="Inativos" />
          <DateField label="Início de" value={startFrom} onChange={(value) => { setStartFrom(value); setPage(1); }} />
          <DateField label="Início até" value={startTo} onChange={(value) => { setStartTo(value); setPage(1); }} />
          <DateField label="Fim de" value={endFrom} onChange={(value) => { setEndFrom(value); setPage(1); }} />
          <DateField label="Fim até" value={endTo} onChange={(value) => { setEndTo(value); setPage(1); }} />
          <ClearFiltersButton onClick={() => { state.clear(); setIsActive("yes"); setStartFrom(""); setStartTo(""); setEndFrom(""); setEndTo(""); setPage(1); }} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar os contratos ativos." /> : !query.data?.data.length ? <EmptyCard text="Nenhum contrato encontrado." /> : (
          <div className="space-y-4">
            <TableWrap headers={["Contrato", "Empresa", "Status", "Vigência", "Executado", "Saldo", "Painel"]}>
              {query.data.data.map((item) => <tr key={item.id} className="border-t border-slate-200/70"><td className="px-4 py-4 font-medium text-slate-900">{item.contract_number}</td><td className="px-4 py-4 text-slate-700">{item.company?.name ?? "-"}</td><td className="px-4 py-4">{item.status ? <Badge variant={getContractStatusBadgeVariant(item.status.value)}>{item.status.label}</Badge> : "-"}</td><td className="px-4 py-4 text-slate-700">{formatDate(item.start_date)} até {formatDate(item.end_date)}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.executed_amount)}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.remaining_amount)}</td><td className="px-4 py-4"><Button asChild size="sm" variant="outline"><Link href={`/contract-reports/contract-panel/${item.id}`}>Abrir</Link></Button></td></tr>)}
            </TableWrap>
            <Pager data={query.data} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </ContractReportShell>
    </ContractReportsGuard>
  );
}

export function ContractExpiringReportPage() {
  const access = useContractReportsAccess();
  const state = useBaseFilters();
  const [expiringInDays, setExpiringInDays] = useState("90");
  const [onlyExpiring, setOnlyExpiring] = useState("yes");
  const [page, setPage] = useState(1);
  const filters = useMemo<ContractReportFilters>(() => ({
    ...state.filters,
    page,
    per_page: 15,
    expiring_in_days: Number(expiringInDays || 90),
    only_expiring: onlyExpiring === "yes" ? true : onlyExpiring === "no" ? false : undefined,
  }), [expiringInDays, onlyExpiring, page, state.filters]);
  const query = useContractExpiringReport(filters, access.enabled);

  return (
    <ContractReportsGuard>
      <ContractReportShell title="Contratos a vencer" description="Contratos com vencimento próximo para ação preventiva da gestão contratual.">
        <FiltersGrid>
          <SearchField value={state.search} onChange={(value) => { state.setSearch(value); setPage(1); }} />
          <ContractSelect value={state.contractId} onChange={(value) => { state.setContractId(value); setPage(1); }} />
          <CompanySelect value={state.companyId} onChange={(value) => { state.setCompanyId(value); setPage(1); }} />
          <ContractTypeSelect value={state.contractTypeId} onChange={(value) => { state.setContractTypeId(value); setPage(1); }} />
          <NumberField label="Janela em dias" value={expiringInDays} onChange={(value) => { setExpiringInDays(value); setPage(1); }} min={1} />
          <YesNoSelect value={onlyExpiring} onChange={(value) => { setOnlyExpiring(value); setPage(1); }} placeholder="Só a vencer" allLabel="Todos" yesLabel="Só a vencer" noLabel="Faixa ampla" />
          <ClearFiltersButton onClick={() => { state.clear(); setExpiringInDays("90"); setOnlyExpiring("yes"); setPage(1); }} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar os contratos a vencer." /> : !query.data?.data.length ? <EmptyCard text="Nenhum contrato a vencer encontrado." /> : (
          <div className="space-y-4">
            <TableWrap headers={["Contrato", "Empresa", "Fim", "Dias restantes", "Executado", "Painel"]}>
              {query.data.data.map((item) => <tr key={item.contract.id} className="border-t border-slate-200/70"><td className="px-4 py-4 font-medium text-slate-900">{item.contract.contract_number}</td><td className="px-4 py-4 text-slate-700">{item.contract.company?.name ?? "-"}</td><td className="px-4 py-4 text-slate-700">{formatDate(item.contract.end_date)}</td><td className="px-4 py-4 text-slate-700">{item.days_until_end ?? "-"}</td><td className="px-4 py-4 text-slate-700">{formatPercent(item.contract.executed_percentage)}</td><td className="px-4 py-4"><Button asChild size="sm" variant="outline"><Link href={`/contract-reports/contract-panel/${item.contract.id}`}>Abrir</Link></Button></td></tr>)}
            </TableWrap>
            <Pager data={query.data} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </ContractReportShell>
    </ContractReportsGuard>
  );
}

export function ContractTransactionsReportPage() {
  const access = useContractReportsAccess();
  const state = useBaseFilters();
  const [transactionType, setTransactionType] = useState("all");
  const [transactionStatus, setTransactionStatus] = useState("all");
  const [transactionFrom, setTransactionFrom] = useState("");
  const [transactionTo, setTransactionTo] = useState("");
  const [page, setPage] = useState(1);
  const filters = useMemo<ContractReportFilters>(() => ({
    ...state.filters,
    page,
    per_page: 15,
    transaction_type: transactionType !== "all" ? (transactionType as ContractReportFilters["transaction_type"]) : undefined,
    transaction_status: transactionStatus !== "all" ? (transactionStatus as ContractReportFilters["transaction_status"]) : undefined,
    transaction_from: transactionFrom || undefined,
    transaction_to: transactionTo || undefined,
  }), [page, state.filters, transactionFrom, transactionStatus, transactionTo, transactionType]);
  const query = useContractTransactionsReport(filters, access.enabled);

  return (
    <ContractReportsGuard>
      <ContractReportShell title="Transações contratuais" description="Histórico financeiro dos contratos com filtros por tipo, status e período.">
        <FiltersGrid>
          <SearchField value={state.search} onChange={(value) => { state.setSearch(value); setPage(1); }} />
          <ContractSelect value={state.contractId} onChange={(value) => { state.setContractId(value); setPage(1); }} />
          <CompanySelect value={state.companyId} onChange={(value) => { state.setCompanyId(value); setPage(1); }} />
          <TransactionTypeSelect value={transactionType} onChange={(value) => { setTransactionType(value); setPage(1); }} />
          <TransactionStatusSelect value={transactionStatus} onChange={(value) => { setTransactionStatus(value); setPage(1); }} />
          <DateField label="Transação de" value={transactionFrom} onChange={(value) => { setTransactionFrom(value); setPage(1); }} />
          <DateField label="Transação até" value={transactionTo} onChange={(value) => { setTransactionTo(value); setPage(1); }} />
          <ClearFiltersButton onClick={() => { state.clear(); setTransactionType("all"); setTransactionStatus("all"); setTransactionFrom(""); setTransactionTo(""); setPage(1); }} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar as transações." /> : !query.data?.data.length ? <EmptyCard text="Nenhuma transação encontrada." /> : (
          <div className="space-y-4">
            <TableWrap headers={["Contrato", "Tipo", "Status", "Data", "Valor", "Documento"]}>
              {query.data.data.map((item) => <tr key={item.id} className="border-t border-slate-200/70"><td className="px-4 py-4 font-medium text-slate-900">{item.contract?.contract_number ?? "-"}</td><td className="px-4 py-4 text-slate-700">{item.type?.label ?? "-"}</td><td className="px-4 py-4"><Badge variant="outline">{item.status?.label ?? "-"}</Badge></td><td className="px-4 py-4 text-slate-700">{formatDate(item.transaction_date)}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.amount)}</td><td className="px-4 py-4 text-slate-700">{item.document_number || item.invoice_number || "-"}</td></tr>)}
            </TableWrap>
            <Pager data={query.data} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </ContractReportShell>
    </ContractReportsGuard>
  );
}

export function ContractAlertsReportPage() {
  const access = useContractReportsAccess();
  const state = useBaseFilters();
  const [alertType, setAlertType] = useState("all");
  const [alertStatus, setAlertStatus] = useState("all");
  const [alertFrom, setAlertFrom] = useState("");
  const [alertTo, setAlertTo] = useState("");
  const [page, setPage] = useState(1);
  const filters = useMemo<ContractReportFilters>(() => ({
    ...state.filters,
    page,
    per_page: 15,
    alert_type: alertType !== "all" ? (alertType as ContractReportFilters["alert_type"]) : undefined,
    alert_status: alertStatus !== "all" ? (alertStatus as ContractReportFilters["alert_status"]) : undefined,
    alert_from: alertFrom || undefined,
    alert_to: alertTo || undefined,
  }), [alertFrom, alertStatus, alertTo, alertType, page, state.filters]);
  const query = useContractAlertsReport(filters, access.enabled);

  return (
    <ContractReportsGuard>
      <ContractReportShell title="Alertas contratuais" description="Alertas de execução financeira e vencimento com acompanhamento do tratamento.">
        <FiltersGrid>
          <SearchField value={state.search} onChange={(value) => { state.setSearch(value); setPage(1); }} />
          <ContractSelect value={state.contractId} onChange={(value) => { state.setContractId(value); setPage(1); }} />
          <CompanySelect value={state.companyId} onChange={(value) => { state.setCompanyId(value); setPage(1); }} />
          <AlertTypeSelect value={alertType} onChange={(value) => { setAlertType(value); setPage(1); }} />
          <AlertStatusSelect value={alertStatus} onChange={(value) => { setAlertStatus(value); setPage(1); }} />
          <DateField label="Alerta de" value={alertFrom} onChange={(value) => { setAlertFrom(value); setPage(1); }} />
          <DateField label="Alerta até" value={alertTo} onChange={(value) => { setAlertTo(value); setPage(1); }} />
          <ClearFiltersButton onClick={() => { state.clear(); setAlertType("all"); setAlertStatus("all"); setAlertFrom(""); setAlertTo(""); setPage(1); }} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar os alertas." /> : !query.data?.data.length ? <EmptyCard text="Nenhum alerta encontrado." /> : (
          <div className="space-y-4">
            <TableWrap headers={["Contrato", "Tipo", "Status", "Data", "Mensagem", "Tratamento"]}>
              {query.data.data.map((item) => <tr key={item.id} className="border-t border-slate-200/70"><td className="px-4 py-4 font-medium text-slate-900">{item.contract?.contract_number ?? "-"}</td><td className="px-4 py-4"><Badge variant={getContractAlertBadgeVariant(item.type?.color)}>{item.type?.label ?? getContractAlertTypeLabel(item.type?.value)}</Badge></td><td className="px-4 py-4"><Badge variant={getContractAlertBadgeVariant(item.status?.color)}>{item.status?.label ?? getContractAlertStatusLabel(item.status?.value)}</Badge></td><td className="px-4 py-4 text-slate-700">{formatDateTime(item.alert_date)}</td><td className="px-4 py-4 text-slate-700">{item.message}</td><td className="px-4 py-4 text-slate-700">{item.resolved_by?.name || item.acknowledged_by?.name || "-"}</td></tr>)}
            </TableWrap>
            <Pager data={query.data} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </ContractReportShell>
    </ContractReportsGuard>
  );
}

export function ContractStatusChangesReportPage() {
  const access = useContractReportsAccess();
  const state = useBaseFilters();
  const [oldStatus, setOldStatus] = useState("all");
  const [newStatus, setNewStatus] = useState("all");
  const [changedFrom, setChangedFrom] = useState("");
  const [changedTo, setChangedTo] = useState("");
  const [page, setPage] = useState(1);
  const filters = useMemo<ContractReportFilters>(() => ({
    ...state.filters,
    page,
    per_page: 15,
    old_status: oldStatus !== "all" ? (oldStatus as ContractReportFilters["old_status"]) : undefined,
    new_status: newStatus !== "all" ? (newStatus as ContractReportFilters["new_status"]) : undefined,
    changed_from: changedFrom || undefined,
    changed_to: changedTo || undefined,
  }), [changedFrom, changedTo, newStatus, oldStatus, page, state.filters]);
  const query = useContractStatusChangesReport(filters, access.enabled);

  return (
    <ContractReportsGuard>
      <ContractReportShell title="Mudanças de status" description="Histórico formal das mudanças de status dos contratos, com motivo e responsável.">
        <FiltersGrid>
          <SearchField value={state.search} onChange={(value) => { state.setSearch(value); setPage(1); }} />
          <ContractSelect value={state.contractId} onChange={(value) => { state.setContractId(value); setPage(1); }} />
          <CompanySelect value={state.companyId} onChange={(value) => { state.setCompanyId(value); setPage(1); }} />
          <StatusSelect value={oldStatus} onChange={(value) => { setOldStatus(value); setPage(1); }} placeholder="Status anterior" />
          <StatusSelect value={newStatus} onChange={(value) => { setNewStatus(value); setPage(1); }} placeholder="Novo status" />
          <DateField label="Mudou de" value={changedFrom} onChange={(value) => { setChangedFrom(value); setPage(1); }} />
          <DateField label="Mudou até" value={changedTo} onChange={(value) => { setChangedTo(value); setPage(1); }} />
          <ClearFiltersButton onClick={() => { state.clear(); setOldStatus("all"); setNewStatus("all"); setChangedFrom(""); setChangedTo(""); setPage(1); }} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar as mudanças de status." /> : !query.data?.data.length ? <EmptyCard text="Nenhuma mudança de status encontrada." /> : (
          <div className="space-y-4">
            <TableWrap headers={["Contrato", "Anterior", "Novo", "Quando", "Responsável", "Motivo"]}>
              {query.data.data.map((item) => <tr key={item.id} className="border-t border-slate-200/70"><td className="px-4 py-4 font-medium text-slate-900">{item.contract?.contract_number ?? "-"}</td><td className="px-4 py-4">{item.old_status ? <Badge variant={getContractStatusBadgeVariant(item.old_status.value)}>{item.old_status.label}</Badge> : "-"}</td><td className="px-4 py-4">{item.new_status ? <Badge variant={getContractStatusBadgeVariant(item.new_status.value)}>{item.new_status.label}</Badge> : "-"}</td><td className="px-4 py-4 text-slate-700">{formatDateTime(item.changed_at)}</td><td className="px-4 py-4 text-slate-700">{item.changed_by?.name || "-"}</td><td className="px-4 py-4 text-slate-700">{item.reason || "-"}</td></tr>)}
            </TableWrap>
            <Pager data={query.data} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </ContractReportShell>
    </ContractReportsGuard>
  );
}

function getRoleLabel(role?: { police_officer?: { war_name?: string | null; registration_number?: string | null; user?: { name?: string | null } | null } | null } | null) {
  if (!role?.police_officer) return "Não definido";
  const warName = role.police_officer.war_name ?? role.police_officer.user?.name ?? "Policial";
  return role.police_officer.registration_number ? `${warName} (${role.police_officer.registration_number})` : warName;
}

export function ContractPanelReportPage() {
  const { id } = useParams<{ id: string }>();
  const access = useContractReportsAccess(true);
  const query = useContractPanelReport(id, access.enabled);

  return (
    <ContractReportsGuard requireView>
      <ContractReportShell title="Painel consolidado do contrato" description="Visão consolidada do contrato com execução, alertas, transações e histórico." href={`/contracts/${id}`}>
        {query.isLoading ? <LoadingCardList /> : query.isError || !query.data?.data ? <ErrorCard text="Não foi possível carregar o painel do contrato." /> : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryMetric label="Transações" value={String(query.data.data.summary.total_transactions)} />
              <SummaryMetric label="Alertas" value={String(query.data.data.summary.total_alerts)} />
              <SummaryMetric label="Alertas pendentes" value={String(query.data.data.summary.pending_alerts)} />
              <SummaryMetric label="% executado" value={formatPercent(query.data.data.summary.executed_percentage)} />
            </div>
            <TableWrap headers={["Contrato", "Empresa", "Status", "Valor", "Executado", "Saldo"]}>
              <tr className="border-t border-slate-200/70">
                <td className="px-4 py-4 font-medium text-slate-900">{query.data.data.contract.contract_number}</td>
                <td className="px-4 py-4 text-slate-700">{query.data.data.contract.company?.name ?? "-"}</td>
                <td className="px-4 py-4">{query.data.data.contract.status ? <Badge variant={getContractStatusBadgeVariant(query.data.data.contract.status.value)}>{query.data.data.contract.status.label}</Badge> : "-"}</td>
                <td className="px-4 py-4 text-slate-700">{formatCurrency(query.data.data.contract.total_value)}</td>
                <td className="px-4 py-4 text-slate-700">{formatCurrency(query.data.data.summary.executed_amount)}</td>
                <td className="px-4 py-4 text-slate-700">{formatCurrency(query.data.data.summary.remaining_amount)}</td>
              </tr>
            </TableWrap>
            <div className="grid gap-4 md:grid-cols-2">
              <SummaryMetric label="Gestor atual" value={getRoleLabel(query.data.data.current_manager_role)} />
              <SummaryMetric label="Fiscal atual" value={getRoleLabel(query.data.data.current_inspector_role)} />
            </div>
            <TableWrap headers={["Renovações", "Aditivos", "Prorrogações", "Mudanças de status"]}>
              <tr className="border-t border-slate-200/70">
                <td className="px-4 py-4 text-slate-700">{query.data.data.renewed_contracts?.length ?? 0}</td>
                <td className="px-4 py-4 text-slate-700">{query.data.data.summary.total_amendments}</td>
                <td className="px-4 py-4 text-slate-700">{query.data.data.summary.total_extensions}</td>
                <td className="px-4 py-4 text-slate-700">{query.data.data.summary.total_status_changes}</td>
              </tr>
            </TableWrap>
            {!!query.data.data.contract_alerts?.length && (
              <TableWrap headers={["Alerta", "Status", "Data", "Mensagem"]}>
                {query.data.data.contract_alerts.slice(0, 5).map((item) => <tr key={item.id} className="border-t border-slate-200/70"><td className="px-4 py-4 text-slate-700">{item.type_label ?? getContractAlertTypeLabel(item.type)}</td><td className="px-4 py-4 text-slate-700">{item.status_label ?? getContractAlertStatusLabel(item.status)}</td><td className="px-4 py-4 text-slate-700">{formatDateTime(item.alert_date)}</td><td className="px-4 py-4 text-slate-700">{item.message || "-"}</td></tr>)}
              </TableWrap>
            )}
          </div>
        )}
      </ContractReportShell>
    </ContractReportsGuard>
  );
}
