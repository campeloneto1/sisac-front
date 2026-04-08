"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import {
  usePatrimonyAcquisitionCostsReport,
  usePatrimonyActiveReport,
  usePatrimonyMovementsReport,
  usePatrimonyPanelReport,
  usePatrimonySectorDistributionReport,
  usePatrimonyStatusOverviewReport,
  usePatrimonyTypeDistributionReport,
  usePatrimonyWriteOffsReport,
} from "@/hooks/use-patrimony-reports";
import type { PatrimonyReportFilters } from "@/types/patrimony-report.type";
import { getPatrimonyStatusVariant } from "@/types/patrimony.type";
import {
  ClearFiltersButton,
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
  PatrimonyReportShell,
  PatrimonyReportsGuard,
  PatrimonySelect,
  PatrimonyTypeSelect,
  SearchField,
  SectorSelect,
  StatusSelect,
  SummaryMetric,
  TableWrap,
  usePatrimonyReportsAccess,
} from "@/components/patrimony-reports/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function useBaseFilters() {
  const [search, setSearch] = useState("");
  const [patrimonyId, setPatrimonyId] = useState("all");
  const [patrimonyTypeId, setPatrimonyTypeId] = useState("all");
  const [currentSectorId, setCurrentSectorId] = useState("all");
  const [status, setStatus] = useState("all");

  const filters = useMemo<PatrimonyReportFilters>(() => ({
    search: search || undefined,
    patrimony_id: patrimonyId !== "all" ? Number(patrimonyId) : undefined,
    patrimony_type_id: patrimonyTypeId !== "all" ? Number(patrimonyTypeId) : undefined,
    current_sector_id: currentSectorId !== "all" ? Number(currentSectorId) : undefined,
    status: status !== "all" ? (status as PatrimonyReportFilters["status"]) : undefined,
  }), [currentSectorId, patrimonyId, patrimonyTypeId, search, status]);

  return {
    search, patrimonyId, patrimonyTypeId, currentSectorId, status,
    setSearch, setPatrimonyId, setPatrimonyTypeId, setCurrentSectorId, setStatus,
    filters,
    clear() {
      setSearch(""); setPatrimonyId("all"); setPatrimonyTypeId("all"); setCurrentSectorId("all"); setStatus("all");
    },
  };
}

export function PatrimonyStatusOverviewReportPage() {
  const access = usePatrimonyReportsAccess();
  const state = useBaseFilters();
  const query = usePatrimonyStatusOverviewReport(state.filters, access.enabled);

  return (
    <PatrimonyReportsGuard>
      <PatrimonyReportShell title="Patrimônios por status" description="Distribuição dos patrimônios por status com valor total de aquisição.">
        <FiltersGrid>
          <SearchField value={state.search} onChange={state.setSearch} />
          <PatrimonyTypeSelect value={state.patrimonyTypeId} onChange={state.setPatrimonyTypeId} />
          <SectorSelect value={state.currentSectorId} onChange={state.setCurrentSectorId} />
          <StatusSelect value={state.status} onChange={state.setStatus} />
          <ClearFiltersButton onClick={state.clear} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar o resumo por status." /> : !query.data?.data.length ? <EmptyCard text="Nenhum agrupamento encontrado." /> : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {query.data.data.map((item) => <SummaryMetric key={item.status.value} label={item.status.label} value={String(item.total_patrimonies)} />)}
            </div>
            <TableWrap headers={["Status", "Total", "Valor de aquisição"]}>
              {query.data.data.map((item) => <tr key={item.status.value} className="border-t border-slate-200/70"><td className="px-4 py-4"><Badge variant={getPatrimonyStatusVariant(item.status.value)}>{item.status.label}</Badge></td><td className="px-4 py-4 text-slate-700">{item.total_patrimonies}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.total_acquisition_value)}</td></tr>)}
            </TableWrap>
          </div>
        )}
      </PatrimonyReportShell>
    </PatrimonyReportsGuard>
  );
}

export function PatrimonyTypeDistributionReportPage() {
  const access = usePatrimonyReportsAccess();
  const state = useBaseFilters();
  const query = usePatrimonyTypeDistributionReport(state.filters, access.enabled);

  return (
    <PatrimonyReportsGuard>
      <PatrimonyReportShell title="Distribuição por tipo" description="Distribuição patrimonial por tipo com volume ativo, baixado e valor investido.">
        <FiltersGrid>
          <SearchField value={state.search} onChange={state.setSearch} />
          <PatrimonyTypeSelect value={state.patrimonyTypeId} onChange={state.setPatrimonyTypeId} />
          <SectorSelect value={state.currentSectorId} onChange={state.setCurrentSectorId} />
          <StatusSelect value={state.status} onChange={state.setStatus} />
          <ClearFiltersButton onClick={state.clear} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar a distribuição por tipo." /> : !query.data?.data.length ? <EmptyCard text="Nenhum tipo encontrado." /> : (
          <TableWrap headers={["Tipo", "Total", "Ativos", "Baixados", "Valor total"]}>
            {query.data.data.map((item) => <tr key={item.patrimony_type.id} className="border-t border-slate-200/70"><td className="px-4 py-4 font-medium text-slate-900">{item.patrimony_type.name}</td><td className="px-4 py-4 text-slate-700">{item.total_patrimonies}</td><td className="px-4 py-4 text-slate-700">{item.active_patrimonies}</td><td className="px-4 py-4 text-slate-700">{item.written_off_patrimonies}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.total_acquisition_value)}</td></tr>)}
          </TableWrap>
        )}
      </PatrimonyReportShell>
    </PatrimonyReportsGuard>
  );
}

export function PatrimonySectorDistributionReportPage() {
  const access = usePatrimonyReportsAccess();
  const state = useBaseFilters();
  const query = usePatrimonySectorDistributionReport(state.filters, access.enabled);

  return (
    <PatrimonyReportsGuard>
      <PatrimonyReportShell title="Distribuição por setor" description="Leitura da alocação patrimonial conforme o setor atual do bem.">
        <FiltersGrid>
          <SearchField value={state.search} onChange={state.setSearch} />
          <PatrimonyTypeSelect value={state.patrimonyTypeId} onChange={state.setPatrimonyTypeId} />
          <SectorSelect value={state.currentSectorId} onChange={state.setCurrentSectorId} />
          <StatusSelect value={state.status} onChange={state.setStatus} />
          <ClearFiltersButton onClick={state.clear} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar a distribuição por setor." /> : !query.data?.data.length ? <EmptyCard text="Nenhum setor encontrado." /> : (
          <TableWrap headers={["Setor", "Total", "Valor de aquisição"]}>
            {query.data.data.map((item) => <tr key={item.sector.id} className="border-t border-slate-200/70"><td className="px-4 py-4 font-medium text-slate-900">{item.sector.abbreviation || item.sector.name}</td><td className="px-4 py-4 text-slate-700">{item.total_patrimonies}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.total_acquisition_value)}</td></tr>)}
          </TableWrap>
        )}
      </PatrimonyReportShell>
    </PatrimonyReportsGuard>
  );
}

function PatrimonySummaryPage({ mode, title, description }: { mode: "active" | "write-offs"; title: string; description: string }) {
  const access = usePatrimonyReportsAccess();
  const state = useBaseFilters();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const filters = useMemo<PatrimonyReportFilters>(() => ({
    ...state.filters,
    page,
    per_page: 15,
    ...(mode === "active" ? { date_from: dateFrom || undefined, date_to: dateTo || undefined } : { disposed_from: dateFrom || undefined, disposed_to: dateTo || undefined }),
  }), [dateFrom, dateTo, mode, page, state.filters]);
  const activeQuery = usePatrimonyActiveReport(filters, access.enabled && mode === "active");
  const writeOffsQuery = usePatrimonyWriteOffsReport(filters, access.enabled && mode === "write-offs");
  const query = mode === "active" ? activeQuery : writeOffsQuery;

  return (
    <PatrimonyReportsGuard>
      <PatrimonyReportShell title={title} description={description}>
        <FiltersGrid>
          <SearchField value={state.search} onChange={(value) => { state.setSearch(value); setPage(1); }} />
          <PatrimonySelect value={state.patrimonyId} onChange={(value) => { state.setPatrimonyId(value); setPage(1); }} />
          <PatrimonyTypeSelect value={state.patrimonyTypeId} onChange={(value) => { state.setPatrimonyTypeId(value); setPage(1); }} />
          <SectorSelect value={state.currentSectorId} onChange={(value) => { state.setCurrentSectorId(value); setPage(1); }} />
          <StatusSelect value={state.status} onChange={(value) => { state.setStatus(value); setPage(1); }} />
          <DateField label={mode === "active" ? "Aquisição de" : "Baixado de"} value={dateFrom} onChange={(value) => { setDateFrom(value); setPage(1); }} />
          <DateField label={mode === "active" ? "Aquisição até" : "Baixado até"} value={dateTo} onChange={(value) => { setDateTo(value); setPage(1); }} />
          <ClearFiltersButton onClick={() => { state.clear(); setDateFrom(""); setDateTo(""); setPage(1); }} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar o relatório patrimonial." /> : !query.data?.data.length ? <EmptyCard text="Nenhum patrimônio encontrado." /> : (
          <div className="space-y-4">
            <TableWrap headers={["Código", "Tipo", "Setor", "Status", "Aquisição", "Valor", "Painel"]}>
              {query.data.data.map((item) => <tr key={item.id} className="border-t border-slate-200/70"><td className="px-4 py-4 font-medium text-slate-900">{item.code}</td><td className="px-4 py-4 text-slate-700">{item.patrimony_type?.name ?? "-"}</td><td className="px-4 py-4 text-slate-700">{item.current_sector?.abbreviation || item.current_sector?.name || "-"}</td><td className="px-4 py-4">{item.status ? <Badge variant={getPatrimonyStatusVariant(item.status.value)}>{item.status.label}</Badge> : "-"}</td><td className="px-4 py-4 text-slate-700">{formatDate(item.acquisition_date)}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.acquisition_value)}</td><td className="px-4 py-4"><Button asChild size="sm" variant="outline"><Link href={`/patrimony-reports/patrimony-panel/${item.id}`}>Abrir</Link></Button></td></tr>)}
            </TableWrap>
            <Pager data={query.data} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </PatrimonyReportShell>
    </PatrimonyReportsGuard>
  );
}

export function PatrimonyActiveReportPage() {
  return <PatrimonySummaryPage mode="active" title="Patrimônios ativos" description="Listagem operacional dos bens ativos dentro da subunidade corrente." />;
}

export function PatrimonyWriteOffsReportPage() {
  return <PatrimonySummaryPage mode="write-offs" title="Baixas patrimoniais" description="Patrimônios devolvidos ou inutilizados com histórico de baixa." />;
}

export function PatrimonyMovementsReportPage() {
  const access = usePatrimonyReportsAccess();
  const state = useBaseFilters();
  const [fromSectorId, setFromSectorId] = useState("all");
  const [toSectorId, setToSectorId] = useState("all");
  const [transferredFrom, setTransferredFrom] = useState("");
  const [transferredTo, setTransferredTo] = useState("");
  const [page, setPage] = useState(1);
  const filters = useMemo<PatrimonyReportFilters>(() => ({
    ...state.filters,
    page,
    per_page: 15,
    from_sector_id: fromSectorId !== "all" ? Number(fromSectorId) : undefined,
    to_sector_id: toSectorId !== "all" ? Number(toSectorId) : undefined,
    transferred_from: transferredFrom || undefined,
    transferred_to: transferredTo || undefined,
  }), [fromSectorId, page, state.filters, toSectorId, transferredFrom, transferredTo]);
  const query = usePatrimonyMovementsReport(filters, access.enabled);

  return (
    <PatrimonyReportsGuard>
      <PatrimonyReportShell title="Movimentações patrimoniais" description="Histórico das transferências setoriais dos patrimônios com origem, destino e responsável.">
        <FiltersGrid>
          <SearchField value={state.search} onChange={(value) => { state.setSearch(value); setPage(1); }} />
          <PatrimonySelect value={state.patrimonyId} onChange={(value) => { state.setPatrimonyId(value); setPage(1); }} />
          <PatrimonyTypeSelect value={state.patrimonyTypeId} onChange={(value) => { state.setPatrimonyTypeId(value); setPage(1); }} />
          <SectorSelect value={fromSectorId} onChange={(value) => { setFromSectorId(value); setPage(1); }} placeholder="Origem" />
          <SectorSelect value={toSectorId} onChange={(value) => { setToSectorId(value); setPage(1); }} placeholder="Destino" />
          <DateField label="Transferido de" value={transferredFrom} onChange={(value) => { setTransferredFrom(value); setPage(1); }} />
          <DateField label="Transferido até" value={transferredTo} onChange={(value) => { setTransferredTo(value); setPage(1); }} />
          <ClearFiltersButton onClick={() => { state.clear(); setFromSectorId("all"); setToSectorId("all"); setTransferredFrom(""); setTransferredTo(""); setPage(1); }} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar as movimentações." /> : !query.data?.data.length ? <EmptyCard text="Nenhuma movimentação encontrada." /> : (
          <div className="space-y-4">
            <TableWrap headers={["Patrimônio", "Origem", "Destino", "Quando", "Responsável", "Motivo"]}>
              {query.data.data.map((item) => <tr key={item.id} className="border-t border-slate-200/70"><td className="px-4 py-4 font-medium text-slate-900">{item.patrimony?.code ?? "-"}</td><td className="px-4 py-4 text-slate-700">{item.from_sector?.abbreviation || item.from_sector?.name || "Alocação inicial"}</td><td className="px-4 py-4 text-slate-700">{item.to_sector?.abbreviation || item.to_sector?.name || "-"}</td><td className="px-4 py-4 text-slate-700">{formatDateTime(item.transferred_at)}</td><td className="px-4 py-4 text-slate-700">{item.transferred_by?.name || "-"}</td><td className="px-4 py-4 text-slate-700">{item.reason || "-"}</td></tr>)}
            </TableWrap>
            <Pager data={query.data} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </PatrimonyReportShell>
    </PatrimonyReportsGuard>
  );
}

export function PatrimonyAcquisitionCostsReportPage() {
  const access = usePatrimonyReportsAccess();
  const state = useBaseFilters();
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const filters = useMemo<PatrimonyReportFilters>(() => ({
    ...state.filters,
    min_acquisition_value: minValue ? Number(minValue) : undefined,
    max_acquisition_value: maxValue ? Number(maxValue) : undefined,
  }), [maxValue, minValue, state.filters]);
  const query = usePatrimonyAcquisitionCostsReport(filters, access.enabled);

  return (
    <PatrimonyReportsGuard>
      <PatrimonyReportShell title="Custos de aquisição" description="Consolidação financeira patrimonial por tipo, com valor total, média e extremos de aquisição.">
        <FiltersGrid>
          <SearchField value={state.search} onChange={state.setSearch} />
          <PatrimonyTypeSelect value={state.patrimonyTypeId} onChange={state.setPatrimonyTypeId} />
          <SectorSelect value={state.currentSectorId} onChange={state.setCurrentSectorId} />
          <StatusSelect value={state.status} onChange={state.setStatus} />
          <CurrencyField label="Valor mínimo" value={minValue} onChange={setMinValue} />
          <CurrencyField label="Valor máximo" value={maxValue} onChange={setMaxValue} />
          <ClearFiltersButton onClick={() => { state.clear(); setMinValue(""); setMaxValue(""); }} />
        </FiltersGrid>
        {query.isLoading ? <LoadingCardList /> : query.isError ? <ErrorCard text="Não foi possível carregar os custos de aquisição." /> : !query.data?.data.length ? <EmptyCard text="Nenhum agrupamento encontrado." /> : (
          <TableWrap headers={["Tipo", "Patrimônios", "Valor total", "Média", "Mínimo", "Máximo"]}>
            {query.data.data.map((item) => <tr key={item.patrimony_type.id} className="border-t border-slate-200/70"><td className="px-4 py-4 font-medium text-slate-900">{item.patrimony_type.name}</td><td className="px-4 py-4 text-slate-700">{item.total_patrimonies}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.total_acquisition_value)}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.average_acquisition_value)}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.min_acquisition_value)}</td><td className="px-4 py-4 text-slate-700">{formatCurrency(item.max_acquisition_value)}</td></tr>)}
          </TableWrap>
        )}
      </PatrimonyReportShell>
    </PatrimonyReportsGuard>
  );
}

export function PatrimonyPanelReportPage() {
  const { id } = useParams<{ id: string }>();
  const access = usePatrimonyReportsAccess(true);
  const query = usePatrimonyPanelReport(id, access.enabled);

  return (
    <PatrimonyReportsGuard requireView>
      <PatrimonyReportShell title="Painel consolidado do patrimônio" description="Visão consolidada do patrimônio com resumo e histórico setorial." href={`/patrimonies/${id}`}>
        {query.isLoading ? <LoadingCardList /> : query.isError || !query.data?.data ? <ErrorCard text="Não foi possível carregar o painel do patrimônio." /> : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <SummaryMetric label="Movimentações" value={String(query.data.data.summary.total_movements)} />
              <SummaryMetric label="Primeira transferência" value={formatDateTime(query.data.data.summary.first_transfer_at)} />
              <SummaryMetric label="Última transferência" value={formatDateTime(query.data.data.summary.last_transfer_at)} />
            </div>
            <TableWrap headers={["Código", "Tipo", "Setor atual", "Status", "Aquisição", "Valor"]}>
              <tr className="border-t border-slate-200/70">
                <td className="px-4 py-4 font-medium text-slate-900">{query.data.data.patrimony.code}</td>
                <td className="px-4 py-4 text-slate-700">{query.data.data.patrimony.patrimony_type?.name ?? "-"}</td>
                <td className="px-4 py-4 text-slate-700">{query.data.data.patrimony.current_sector?.abbreviation || query.data.data.patrimony.current_sector?.name || "-"}</td>
                <td className="px-4 py-4">{query.data.data.patrimony.status ? <Badge variant={getPatrimonyStatusVariant(query.data.data.patrimony.status.value)}>{query.data.data.patrimony.status.label}</Badge> : "-"}</td>
                <td className="px-4 py-4 text-slate-700">{formatDate(query.data.data.patrimony.acquisition_date)}</td>
                <td className="px-4 py-4 text-slate-700">{formatCurrency(query.data.data.patrimony.acquisition_value)}</td>
              </tr>
            </TableWrap>
            {!query.data.data.movements.length ? <EmptyCard text="Nenhuma movimentação registrada." /> : (
              <TableWrap headers={["Origem", "Destino", "Quando", "Responsável", "Motivo"]}>
                {query.data.data.movements.map((item) => <tr key={item.id} className="border-t border-slate-200/70"><td className="px-4 py-4 text-slate-700">{item.from_sector?.abbreviation || item.from_sector?.name || "Alocação inicial"}</td><td className="px-4 py-4 text-slate-700">{item.to_sector?.abbreviation || item.to_sector?.name || "-"}</td><td className="px-4 py-4 text-slate-700">{formatDateTime(item.transferred_at)}</td><td className="px-4 py-4 text-slate-700">{item.transferred_by?.name || "-"}</td><td className="px-4 py-4 text-slate-700">{item.reason || "-"}</td></tr>)}
              </TableWrap>
            )}
          </div>
        )}
      </PatrimonyReportShell>
    </PatrimonyReportsGuard>
  );
}
