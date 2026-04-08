"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import {
  useArmamentActiveLoansReport,
  useArmamentAvailabilityReport,
  useArmamentAvailableBatchesReport,
  useArmamentAvailableUnitsReport,
  useArmamentCautelasReport,
  useArmamentCriticalOccurrencesReport,
  useArmamentExpiringBatchesReport,
  useArmamentExpiringUnitsReport,
  useArmamentInventoryReport,
  useArmamentLoansReport,
  useArmamentMovementsReport,
  useArmamentOccurrencesReport,
  useArmamentPanelReport,
  useArmamentReturnDivergencesReport,
} from "@/hooks/use-armament-reports";
import { getArmamentLoanKindVariant, getArmamentLoanStatusVariant } from "@/types/armament-loan.type";
import { getArmamentOccurrenceSeverityVariant } from "@/types/armament-occurrence.type";
import type { ArmamentReportFilters } from "@/types/armament-report.type";
import {
  ArmamentCaliberSelect,
  ArmamentReportShell,
  ArmamentReportsGuard,
  ArmamentSelect,
  ArmamentSizeSelect,
  ArmamentTypeSelect,
  ClearFiltersButton,
  DateField,
  EmptyCard,
  ErrorCard,
  FiltersGrid,
  formatArmamentLabel,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
  LoadingCardList,
  LoanKindSelect,
  LoanStatusSelect,
  MovementTypeSelect,
  OccurrenceStatusSelect,
  OccurrenceTypeSelect,
  Pager,
  PoliceOfficerSelect,
  SearchField,
  SummaryMetric,
  TableWrap,
  UnitStatusSelect,
  useArmamentReportsAccess,
} from "@/components/armament-reports/shared";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

function useBaseFilters() {
  const [search, setSearch] = useState("");
  const [armamentId, setArmamentId] = useState("all");
  const [armamentTypeId, setArmamentTypeId] = useState("all");
  const [caliberId, setCaliberId] = useState("all");
  const [sizeId, setSizeId] = useState("all");

  const filters = useMemo<ArmamentReportFilters>(
    () => ({
      search: search || undefined,
      armament_id: armamentId !== "all" ? Number(armamentId) : undefined,
      armament_type_id: armamentTypeId !== "all" ? Number(armamentTypeId) : undefined,
      armament_caliber_id: caliberId !== "all" ? Number(caliberId) : undefined,
      armament_size_id: sizeId !== "all" ? Number(sizeId) : undefined,
    }),
    [armamentId, armamentTypeId, caliberId, search, sizeId],
  );

  return {
    search,
    armamentId,
    armamentTypeId,
    caliberId,
    sizeId,
    setSearch,
    setArmamentId,
    setArmamentTypeId,
    setCaliberId,
    setSizeId,
    filters,
    clear() {
      setSearch("");
      setArmamentId("all");
      setArmamentTypeId("all");
      setCaliberId("all");
      setSizeId("all");
    },
  };
}

export function ArmamentInventoryReportPage() {
  const access = useArmamentReportsAccess();
  const state = useBaseFilters();
  const query = useArmamentInventoryReport(state.filters, access.enabled);

  return (
    <ArmamentReportsGuard>
      <ArmamentReportShell title="Inventário" description="Consolidado por armamento com unidades por status e saldo em lotes.">
        <FiltersGrid>
          <SearchField value={state.search} onChange={state.setSearch} />
          <ArmamentSelect value={state.armamentId} onChange={state.setArmamentId} />
          <ArmamentTypeSelect value={state.armamentTypeId} onChange={state.setArmamentTypeId} />
          <ArmamentCaliberSelect value={state.caliberId} onChange={state.setCaliberId} />
          <ArmamentSizeSelect value={state.sizeId} onChange={state.setSizeId} />
          <ClearFiltersButton onClick={state.clear} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar o inventário." /> : !query.data?.data.length ? <EmptyCard text="Nenhum item encontrado." /> : (
          <TableWrap headers={["Armamento", "Unidades", "Disponíveis", "Emprestadas", "Cauteladas", "Manutenção", "Lotes disponíveis"]}>
            {query.data.data.map((item) => (
              <tr key={item.armament.id} className="border-t border-slate-200/70">
                <td className="px-4 py-4 font-medium text-slate-900">{[item.armament.type, item.armament.variant, item.armament.caliber, item.armament.size].filter(Boolean).join(" • ")}</td>
                <td className="px-4 py-4 text-slate-700">{formatNumber(item.total_units)}</td>
                <td className="px-4 py-4 text-slate-700">{formatNumber(item.available_units)}</td>
                <td className="px-4 py-4 text-slate-700">{formatNumber(item.loaned_units)}</td>
                <td className="px-4 py-4 text-slate-700">{formatNumber(item.assigned_units)}</td>
                <td className="px-4 py-4 text-slate-700">{formatNumber(item.maintenance_units)}</td>
                <td className="px-4 py-4 text-slate-700">{formatNumber(item.available_batches_quantity)}</td>
              </tr>
            ))}
          </TableWrap>
        )}
      </ArmamentReportShell>
    </ArmamentReportsGuard>
  );
}

export function ArmamentAvailabilityReportPage() {
  const access = useArmamentReportsAccess();
  const state = useBaseFilters();
  const query = useArmamentAvailabilityReport(state.filters, access.enabled);

  return (
    <ArmamentReportsGuard>
      <ArmamentReportShell title="Disponibilidade" description="Resumo agregado das unidades por status operacional.">
        <FiltersGrid>
          <SearchField value={state.search} onChange={state.setSearch} />
          <ArmamentSelect value={state.armamentId} onChange={state.setArmamentId} />
          <ArmamentTypeSelect value={state.armamentTypeId} onChange={state.setArmamentTypeId} />
          <ArmamentCaliberSelect value={state.caliberId} onChange={state.setCaliberId} />
          <ArmamentSizeSelect value={state.sizeId} onChange={state.setSizeId} />
          <ClearFiltersButton onClick={state.clear} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar a disponibilidade." /> : !query.data?.data.length ? <EmptyCard text="Nenhum agrupamento encontrado." /> : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {query.data.data.map((item) => <SummaryMetric key={item.status} label={item.label} value={formatNumber(item.total_units)} />)}
            </div>
            <TableWrap headers={["Status", "Total"]}>
              {query.data.data.map((item) => <tr key={item.status} className="border-t border-slate-200/70"><td className="px-4 py-4 font-medium text-slate-900">{item.label}</td><td className="px-4 py-4 text-slate-700">{formatNumber(item.total_units)}</td></tr>)}
            </TableWrap>
          </div>
        )}
      </ArmamentReportShell>
    </ArmamentReportsGuard>
  );
}

function UnitStatusPage({ mode, title, description }: { mode: "available" | "expiring"; title: string; description: string }) {
  const access = useArmamentReportsAccess();
  const state = useBaseFilters();
  const [unitStatus, setUnitStatus] = useState("all");
  const [days, setDays] = useState("30");
  const [page, setPage] = useState(1);
  const filters = useMemo<ArmamentReportFilters>(() => ({
    ...state.filters,
    page,
    per_page: 15,
    unit_status: unitStatus !== "all" ? unitStatus as ArmamentReportFilters["unit_status"] : undefined,
    expiring_in_days: mode === "expiring" ? Number(days) : undefined,
    only_active: mode === "expiring" ? true : undefined,
  }), [days, mode, page, state.filters, unitStatus]);
  const availableQuery = useArmamentAvailableUnitsReport(filters, access.enabled && mode === "available");
  const expiringQuery = useArmamentExpiringUnitsReport(filters, access.enabled && mode === "expiring");
  const query = mode === "available" ? availableQuery : expiringQuery;

  return (
    <ArmamentReportsGuard>
      <ArmamentReportShell title={title} description={description}>
        <FiltersGrid>
          <SearchField value={state.search} onChange={(value) => { state.setSearch(value); setPage(1); }} />
          <ArmamentSelect value={state.armamentId} onChange={(value) => { state.setArmamentId(value); setPage(1); }} />
          <ArmamentTypeSelect value={state.armamentTypeId} onChange={(value) => { state.setArmamentTypeId(value); setPage(1); }} />
          <ArmamentCaliberSelect value={state.caliberId} onChange={(value) => { state.setCaliberId(value); setPage(1); }} />
          <ArmamentSizeSelect value={state.sizeId} onChange={(value) => { state.setSizeId(value); setPage(1); }} />
          <UnitStatusSelect value={unitStatus} onChange={(value) => { setUnitStatus(value); setPage(1); }} />
          {mode === "expiring" ? <InputDays value={days} onChange={(value) => { setDays(value); setPage(1); }} /> : null}
          <ClearFiltersButton onClick={() => { state.clear(); setUnitStatus("all"); setDays("30"); setPage(1); }} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar as unidades." /> : !query.data?.data.length ? <EmptyCard text="Nenhuma unidade encontrada." /> : (
          <div className="space-y-4">
            <TableWrap headers={["Série", "Armamento", "Aquisição", "Validade", "Status", "Situação"]}>
              {query.data.data.map((item) => (
                <tr key={item.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">{item.serial_number ?? "-"}</td>
                  <td className="px-4 py-4 text-slate-700">{formatArmamentLabel(item.armament)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatDate(item.acquisition_date)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatDate(item.expiration_date)}</td>
                  <td className="px-4 py-4"><Badge variant="outline">{item.status?.label ?? "-"}</Badge></td>
                  <td className="px-4 py-4 text-slate-700">{item.is_expired ? "Vencida" : item.is_expiring_soon ? "A vencer" : "Regular"}</td>
                </tr>
              ))}
            </TableWrap>
            <Pager data={query.data} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </ArmamentReportShell>
    </ArmamentReportsGuard>
  );
}

function BatchStatusPage({ mode, title, description }: { mode: "available" | "expiring"; title: string; description: string }) {
  const access = useArmamentReportsAccess();
  const state = useBaseFilters();
  const [days, setDays] = useState("30");
  const [page, setPage] = useState(1);
  const filters = useMemo<ArmamentReportFilters>(() => ({ ...state.filters, page, per_page: 15, expiring_in_days: mode === "expiring" ? Number(days) : undefined }), [days, mode, page, state.filters]);
  const availableQuery = useArmamentAvailableBatchesReport(filters, access.enabled && mode === "available");
  const expiringQuery = useArmamentExpiringBatchesReport(filters, access.enabled && mode === "expiring");
  const query = mode === "available" ? availableQuery : expiringQuery;

  return (
    <ArmamentReportsGuard>
      <ArmamentReportShell title={title} description={description}>
        <FiltersGrid>
          <SearchField value={state.search} onChange={(value) => { state.setSearch(value); setPage(1); }} />
          <ArmamentSelect value={state.armamentId} onChange={(value) => { state.setArmamentId(value); setPage(1); }} />
          <ArmamentTypeSelect value={state.armamentTypeId} onChange={(value) => { state.setArmamentTypeId(value); setPage(1); }} />
          <ArmamentCaliberSelect value={state.caliberId} onChange={(value) => { state.setCaliberId(value); setPage(1); }} />
          <ArmamentSizeSelect value={state.sizeId} onChange={(value) => { state.setSizeId(value); setPage(1); }} />
          {mode === "expiring" ? <InputDays value={days} onChange={(value) => { setDays(value); setPage(1); }} /> : null}
          <ClearFiltersButton onClick={() => { state.clear(); setDays("30"); setPage(1); }} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar os lotes." /> : !query.data?.data.length ? <EmptyCard text="Nenhum lote encontrado." /> : (
          <div className="space-y-4">
            <TableWrap headers={["Lote", "Armamento", "Quantidade", "Disponível", "% disponível", "Validade", "Situação"]}>
              {query.data.data.map((item) => (
                <tr key={item.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">{item.batch_number ?? "-"}</td>
                  <td className="px-4 py-4 text-slate-700">{formatArmamentLabel(item.armament)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatNumber(item.quantity)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatNumber(item.available_quantity)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatPercent(item.available_percentage)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatDate(item.expiration_date)}</td>
                  <td className="px-4 py-4 text-slate-700">{item.is_expired ? "Vencido" : item.is_expiring_soon ? "A vencer" : "Regular"}</td>
                </tr>
              ))}
            </TableWrap>
            <Pager data={query.data} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </ArmamentReportShell>
    </ArmamentReportsGuard>
  );
}

function LoansPage({ mode, title, description }: { mode: "loans" | "active" | "cautelas" | "divergences"; title: string; description: string }) {
  const access = useArmamentReportsAccess();
  const [policeOfficerId, setPoliceOfficerId] = useState("all");
  const [loanStatus, setLoanStatus] = useState(mode === "active" ? "open" : "all");
  const [kind, setKind] = useState(mode === "cautelas" ? "cautela" : "all");
  const [loanedFrom, setLoanedFrom] = useState("");
  const [loanedTo, setLoanedTo] = useState("");
  const [page, setPage] = useState(1);
  const filters = useMemo<ArmamentReportFilters>(() => ({
    page,
    per_page: 15,
    police_officer_id: policeOfficerId !== "all" ? Number(policeOfficerId) : undefined,
    loan_status: loanStatus !== "all" ? loanStatus as ArmamentReportFilters["loan_status"] : undefined,
    kind: kind !== "all" ? kind as ArmamentReportFilters["kind"] : undefined,
    loaned_from: loanedFrom || undefined,
    loaned_to: loanedTo || undefined,
  }), [kind, loanStatus, loanedFrom, loanedTo, page, policeOfficerId]);
  const loansQuery = useArmamentLoansReport(filters, access.enabled && mode === "loans");
  const activeQuery = useArmamentActiveLoansReport(filters, access.enabled && mode === "active");
  const cautelasQuery = useArmamentCautelasReport(filters, access.enabled && mode === "cautelas");
  const divergencesQuery = useArmamentReturnDivergencesReport(filters, access.enabled && mode === "divergences");
  const query = mode === "active" ? activeQuery : mode === "cautelas" ? cautelasQuery : mode === "divergences" ? divergencesQuery : loansQuery;

  return (
    <ArmamentReportsGuard>
      <ArmamentReportShell title={title} description={description}>
        <FiltersGrid>
          <PoliceOfficerSelect value={policeOfficerId} onChange={(value) => { setPoliceOfficerId(value); setPage(1); }} />
          <LoanStatusSelect value={loanStatus} onChange={(value) => { setLoanStatus(value); setPage(1); }} />
          <LoanKindSelect value={kind} onChange={(value) => { setKind(value); setPage(1); }} />
          <DateField label="Emprestado de" value={loanedFrom} onChange={(value) => { setLoanedFrom(value); setPage(1); }} />
          <DateField label="Emprestado até" value={loanedTo} onChange={(value) => { setLoanedTo(value); setPage(1); }} />
          <ClearFiltersButton onClick={() => { setPoliceOfficerId("all"); setLoanStatus(mode === "active" ? "open" : "all"); setKind(mode === "cautelas" ? "cautela" : "all"); setLoanedFrom(""); setLoanedTo(""); setPage(1); }} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar os empréstimos." /> : !query.data?.data.length ? <EmptyCard text="Nenhum empréstimo encontrado." /> : (
          <div className="space-y-4">
            <TableWrap headers={["Policial", "Tipo", "Status", "Emprestado em", "Prev. devolução", "Itens"]}>
              {query.data.data.map((item) => (
                <tr key={item.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">{item.police_officer?.war_name ?? item.police_officer?.name ?? "-"}</td>
                  <td className="px-4 py-4"><Badge variant={getArmamentLoanKindVariant(item.kind)}>{item.kind_label ?? "-"}</Badge></td>
                  <td className="px-4 py-4"><Badge variant={getArmamentLoanStatusVariant(item.status)}>{item.status_label ?? "-"}</Badge></td>
                  <td className="px-4 py-4 text-slate-700">{formatDateTime(item.loaned_at)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatDateTime(item.expected_return_at)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatNumber(item.total_quantity)}</td>
                </tr>
              ))}
            </TableWrap>
            <Pager data={query.data} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </ArmamentReportShell>
    </ArmamentReportsGuard>
  );
}

export function ArmamentMovementsReportPage() {
  const access = useArmamentReportsAccess();
  const state = useBaseFilters();
  const [movementType, setMovementType] = useState("all");
  const [movedFrom, setMovedFrom] = useState("");
  const [movedTo, setMovedTo] = useState("");
  const [page, setPage] = useState(1);
  const filters = useMemo<ArmamentReportFilters>(() => ({ ...state.filters, page, per_page: 15, movement_type: movementType !== "all" ? movementType as ArmamentReportFilters["movement_type"] : undefined, moved_from: movedFrom || undefined, moved_to: movedTo || undefined }), [movedFrom, movedTo, movementType, page, state.filters]);
  const query = useArmamentMovementsReport(filters, access.enabled);

  return (
    <ArmamentReportsGuard>
      <ArmamentReportShell title="Movimentações" description="Histórico de entradas, saídas, cautelas, baixas e ajustes.">
        <FiltersGrid>
          <SearchField value={state.search} onChange={(value) => { state.setSearch(value); setPage(1); }} />
          <ArmamentSelect value={state.armamentId} onChange={(value) => { state.setArmamentId(value); setPage(1); }} />
          <MovementTypeSelect value={movementType} onChange={(value) => { setMovementType(value); setPage(1); }} />
          <DateField label="Movido de" value={movedFrom} onChange={(value) => { setMovedFrom(value); setPage(1); }} />
          <DateField label="Movido até" value={movedTo} onChange={(value) => { setMovedTo(value); setPage(1); }} />
          <ClearFiltersButton onClick={() => { state.clear(); setMovementType("all"); setMovedFrom(""); setMovedTo(""); setPage(1); }} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar as movimentações." /> : !query.data?.data.length ? <EmptyCard text="Nenhuma movimentação encontrada." /> : (
          <div className="space-y-4">
            <TableWrap headers={["Armamento", "Tipo", "Qtd.", "Movido em", "Unidade/Lote", "Autorizado por"]}>
              {query.data.data.map((item) => (
                <tr key={item.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">{formatArmamentLabel(item.armament)}</td>
                  <td className="px-4 py-4"><Badge variant="outline">{item.type?.label ?? "-"}</Badge></td>
                  <td className="px-4 py-4 text-slate-700">{formatNumber(item.quantity)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatDateTime(item.moved_at)}</td>
                  <td className="px-4 py-4 text-slate-700">{item.unit?.serial_number ?? item.batch?.batch_number ?? "-"}</td>
                  <td className="px-4 py-4 text-slate-700">{item.authorized_by?.name ?? "-"}</td>
                </tr>
              ))}
            </TableWrap>
            <Pager data={query.data} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </ArmamentReportShell>
    </ArmamentReportsGuard>
  );
}

function OccurrencesPage({ mode, title, description }: { mode: "all" | "critical"; title: string; description: string }) {
  const access = useArmamentReportsAccess();
  const state = useBaseFilters();
  const [occurrenceType, setOccurrenceType] = useState("all");
  const [occurrenceStatus, setOccurrenceStatus] = useState("all");
  const [occurredFrom, setOccurredFrom] = useState("");
  const [occurredTo, setOccurredTo] = useState("");
  const [page, setPage] = useState(1);
  const filters = useMemo<ArmamentReportFilters>(() => ({ ...state.filters, page, per_page: 15, occurrence_type: occurrenceType !== "all" ? occurrenceType as ArmamentReportFilters["occurrence_type"] : undefined, occurrence_status: occurrenceStatus !== "all" ? occurrenceStatus as ArmamentReportFilters["occurrence_status"] : undefined, occurred_from: occurredFrom || undefined, occurred_to: occurredTo || undefined, only_critical: mode === "critical" ? true : undefined }), [mode, occurredFrom, occurredTo, occurrenceStatus, occurrenceType, page, state.filters]);
  const allQuery = useArmamentOccurrencesReport(filters, access.enabled && mode === "all");
  const criticalQuery = useArmamentCriticalOccurrencesReport(filters, access.enabled && mode === "critical");
  const query = mode === "critical" ? criticalQuery : allQuery;

  return (
    <ArmamentReportsGuard>
      <ArmamentReportShell title={title} description={description}>
        <FiltersGrid>
          <SearchField value={state.search} onChange={(value) => { state.setSearch(value); setPage(1); }} />
          <ArmamentSelect value={state.armamentId} onChange={(value) => { state.setArmamentId(value); setPage(1); }} />
          <OccurrenceTypeSelect value={occurrenceType} onChange={(value) => { setOccurrenceType(value); setPage(1); }} />
          <OccurrenceStatusSelect value={occurrenceStatus} onChange={(value) => { setOccurrenceStatus(value); setPage(1); }} />
          <DateField label="Ocorrido de" value={occurredFrom} onChange={(value) => { setOccurredFrom(value); setPage(1); }} />
          <DateField label="Ocorrido até" value={occurredTo} onChange={(value) => { setOccurredTo(value); setPage(1); }} />
          <ClearFiltersButton onClick={() => { state.clear(); setOccurrenceType("all"); setOccurrenceStatus("all"); setOccurredFrom(""); setOccurredTo(""); setPage(1); }} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar as ocorrências." /> : !query.data?.data.length ? <EmptyCard text="Nenhuma ocorrência encontrada." /> : (
          <div className="space-y-4">
            {query.data.summary?.length ? <div className="grid gap-4 xl:grid-cols-3">{query.data.summary.map((item, index) => <SummaryMetric key={`${item.type?.value ?? "type"}-${item.status?.value ?? "status"}-${index}`} label={`${item.type?.label ?? "Tipo"} • ${item.status?.label ?? "Status"}`} value={formatNumber(item.total_occurrences)} />)}</div> : null}
            <TableWrap headers={["Armamento", "Tipo", "Status", "Data", "BO", "Dias", "Reportado por"]}>
              {query.data.data.map((item) => (
                <tr key={item.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">{formatArmamentLabel(item.armament)}</td>
                  <td className="px-4 py-4"><Badge variant={getArmamentOccurrenceSeverityVariant(item.type?.severity ?? "low")}>{item.type?.label ?? "-"}</Badge></td>
                  <td className="px-4 py-4"><Badge variant="outline">{item.status?.label ?? "-"}</Badge></td>
                  <td className="px-4 py-4 text-slate-700">{formatDateTime(item.occurred_at)}</td>
                  <td className="px-4 py-4 text-slate-700">{item.report_number ?? "-"}</td>
                  <td className="px-4 py-4 text-slate-700">{formatNumber(item.days_since_occurred)}</td>
                  <td className="px-4 py-4 text-slate-700">{item.reported_by?.name ?? "-"}</td>
                </tr>
              ))}
            </TableWrap>
            <Pager data={query.data} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </ArmamentReportShell>
    </ArmamentReportsGuard>
  );
}

function InputDays({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Dias para vencimento</p>
      <Input type="number" min="1" max="365" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

export function ArmamentAvailableUnitsReportPage() { return <UnitStatusPage mode="available" title="Unidades disponíveis" description="Lista das unidades disponíveis para uso." />; }
export function ArmamentExpiringUnitsReportPage() { return <UnitStatusPage mode="expiring" title="Unidades vencidas ou a vencer" description="Controle preventivo de validade das unidades." />; }
export function ArmamentAvailableBatchesReportPage() { return <BatchStatusPage mode="available" title="Lotes disponíveis" description="Lotes com saldo utilizável e percentual disponível." />; }
export function ArmamentExpiringBatchesReportPage() { return <BatchStatusPage mode="expiring" title="Lotes vencidos ou a vencer" description="Controle preventivo de validade dos lotes." />; }
export function ArmamentLoansReportPage() { return <LoansPage mode="loans" title="Empréstimos" description="Histórico operacional de empréstimos de armamento." />; }
export function ArmamentActiveLoansReportPage() { return <LoansPage mode="active" title="Empréstimos ativos" description="Empréstimos em aberto e em atraso." />; }
export function ArmamentCautelasReportPage() { return <LoansPage mode="cautelas" title="Cautelas" description="Empréstimos do tipo cautela." />; }
export function ArmamentReturnDivergencesReportPage() { return <LoansPage mode="divergences" title="Divergências de devolução" description="Consumo, perda ou divergências na devolução." />; }
export function ArmamentOccurrencesReportPage() { return <OccurrencesPage mode="all" title="Ocorrências" description="Ocorrências com resumo por tipo e status." />; }
export function ArmamentCriticalOccurrencesReportPage() { return <OccurrencesPage mode="critical" title="Ocorrências críticas" description="Extravio e furto/roubo com foco prioritário." />; }

export function ArmamentPanelReportPage() {
  const access = useArmamentReportsAccess(true);
  const params = useParams<{ id: string }>();
  const query = useArmamentPanelReport(params.id, access.enabled);

  return (
    <ArmamentReportsGuard requireView>
      <ArmamentReportShell title="Painel consolidado do armamento" description="Visão única do armamento com unidades, lotes, movimentações, ocorrências e empréstimos.">
        {query.isLoading ? <LoadingCardList count={6} /> : query.isError || !query.data?.data ? <ErrorCard text="Não foi possível carregar o painel consolidado do armamento." /> : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <SummaryMetric label="Unidades" value={formatNumber(query.data.data.summary.total_units)} />
              <SummaryMetric label="Disponíveis" value={formatNumber(query.data.data.summary.available_units)} />
              <SummaryMetric label="Lotes" value={formatNumber(query.data.data.summary.total_batches)} />
              <SummaryMetric label="Movimentações" value={formatNumber(query.data.data.summary.total_movements)} />
              <SummaryMetric label="Ocorrências" value={formatNumber(query.data.data.summary.total_occurrences)} />
            </div>
            <TableWrap headers={["Resumo", "Valor"]}>
              <tr className="border-t border-slate-200/70"><td className="px-4 py-4 font-medium text-slate-900">Armamento</td><td className="px-4 py-4 text-slate-700">{formatArmamentLabel(query.data.data.armament)}</td></tr>
              <tr className="border-t border-slate-200/70"><td className="px-4 py-4 font-medium text-slate-900">Subunidade</td><td className="px-4 py-4 text-slate-700">{query.data.data.armament.subunit?.name ?? "-"}</td></tr>
              <tr className="border-t border-slate-200/70"><td className="px-4 py-4 font-medium text-slate-900">Unidades emprestadas</td><td className="px-4 py-4 text-slate-700">{formatNumber(query.data.data.summary.loaned_units)}</td></tr>
              <tr className="border-t border-slate-200/70"><td className="px-4 py-4 font-medium text-slate-900">Unidades em manutenção</td><td className="px-4 py-4 text-slate-700">{formatNumber(query.data.data.summary.maintenance_units)}</td></tr>
            </TableWrap>
          </div>
        )}
      </ArmamentReportShell>
    </ArmamentReportsGuard>
  );
}
