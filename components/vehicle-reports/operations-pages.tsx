"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CarFront, FileWarning, Fuel, Shield, Wrench } from "lucide-react";
import { useMemo, useState } from "react";

import {
  useVehicleActiveCustodiesReport,
  useVehicleActiveLoansReport,
  useVehicleAvailableReport,
  useVehicleDamagesReport,
  useVehicleExpiringRentalsReport,
  useVehicleFuelingsReport,
  useVehicleLoansReport,
  useVehicleMaintenancesReport,
  useVehiclePanelReport,
  useVehicleRentalsReport,
  useVehicleUnavailableReport,
} from "@/hooks/use-vehicle-reports";
import {
  getVehicleCustodyCustodianLabel,
  getVehicleCustodyStatusVariant,
} from "@/types/vehicle-custody.type";
import {
  getVehicleDamageContextLabel,
  getVehicleDamageSeverityVariant,
  getVehicleDamageStatusVariant,
} from "@/types/vehicle-damage.type";
import {
  getVehicleFuelingContextLabel,
  getVehicleFuelTypeVariant,
} from "@/types/vehicle-fueling.type";
import { getVehicleLoanBorrowerLabel, getVehicleLoanStatusVariant } from "@/types/vehicle-loan.type";
import { getVehicleMaintenanceStatusVariant } from "@/types/vehicle-maintenance.type";
import type { VehicleReportFilters } from "@/types/vehicle-report.type";
import { getVehicleRentalStatusVariant } from "@/types/vehicle-rental.type";
import {
  ClearFiltersButton,
  CompanySelect,
  DamageSeveritySelect,
  DamageStatusSelect,
  DamageTypeSelect,
  DateField,
  DetectionMomentSelect,
  EmptyCard,
  ErrorCard,
  FiltersGrid,
  formatCurrency,
  formatDate,
  formatNumber,
  formatVehicleLabel,
  FuelTypeSelect,
  LoadingCardList,
  LoanStatusSelect,
  MaintenanceStatusSelect,
  MaintenanceTypeSelect,
  Pager,
  RentalStatusSelect,
  SearchField,
  SummaryMetric,
  TableWrap,
  useVehicleReportsAccess,
  VehicleMiniStat,
  VehicleReportShell,
  VehicleReportsGuard,
  VehicleSelect,
  WorkshopSelect,
} from "@/components/vehicle-reports/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function VehicleAvailableReportPage() {
  const access = useVehicleReportsAccess();
  const [search, setSearch] = useState("");
  const [vehicleId, setVehicleId] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo<VehicleReportFilters>(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      vehicle_id: vehicleId !== "all" ? Number(vehicleId) : undefined,
      start_date: dateFrom || undefined,
      end_date: dateTo || undefined,
    }),
    [dateFrom, dateTo, page, search, vehicleId],
  );

  const reportQuery = useVehicleAvailableReport(filters, access.enabled);

  return (
    <VehicleReportsGuard>
      <VehicleReportShell
        title="Veículos disponíveis"
        description="Lista operacional dos veículos disponíveis no período informado, já respeitando a subunidade ativa."
        icon={CarFront}
      >
        <FiltersGrid>
          <SearchField placeholder="Buscar por placa, placa especial, chassi ou RENAVAM" value={search} onChange={(value) => { setSearch(value); setPage(1); }} />
          <VehicleSelect value={vehicleId} onChange={(value) => { setVehicleId(value); setPage(1); }} />
          <DateField label="Data inicial" value={dateFrom} onChange={(value) => { setDateFrom(value); setPage(1); }} />
          <DateField label="Data final" value={dateTo} onChange={(value) => { setDateTo(value); setPage(1); }} />
          <ClearFiltersButton onClick={() => { setSearch(""); setVehicleId("all"); setDateFrom(""); setDateTo(""); setPage(1); }} />
        </FiltersGrid>

        {reportQuery.isLoading ? (
          <LoadingCardList />
        ) : reportQuery.isError ? (
          <ErrorCard text="Não foi possível carregar os veículos disponíveis." />
        ) : !reportQuery.data?.data.length ? (
          <EmptyCard text="Nenhum veículo disponível encontrado para o período informado." />
        ) : (
          <div className="space-y-4">
            <TableWrap headers={["Veículo", "Status", "Posse", "Subunidade", "KM atual", "Painel"]}>
              {reportQuery.data.data.map((item) => (
                <tr key={item.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-900">{formatVehicleLabel(item)}</p>
                    <p className="text-xs text-slate-500">{item.subunit?.abbreviation ?? item.subunit?.name ?? "-"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="success">{item.operational_status?.label ?? "Disponível"}</Badge>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{item.ownership_type?.label ?? "-"}</td>
                  <td className="px-4 py-4 text-slate-700">{item.subunit?.name ?? "-"}</td>
                  <td className="px-4 py-4 text-slate-700">{formatNumber(item.current_km)}</td>
                  <td className="px-4 py-4">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/vehicle-reports/vehicle-panel/${item.id}`}>Abrir</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </TableWrap>
            <Pager data={reportQuery.data} onPageChange={setPage} disabled={reportQuery.isFetching} />
          </div>
        )}
      </VehicleReportShell>
    </VehicleReportsGuard>
  );
}

export function VehicleUnavailableReportPage() {
  const access = useVehicleReportsAccess();
  const [search, setSearch] = useState("");
  const [vehicleId, setVehicleId] = useState("all");
  const [page, setPage] = useState(1);

  const filters = useMemo<VehicleReportFilters>(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      vehicle_id: vehicleId !== "all" ? Number(vehicleId) : undefined,
    }),
    [page, search, vehicleId],
  );

  const reportQuery = useVehicleUnavailableReport(filters, access.enabled);

  return (
    <VehicleReportsGuard>
      <VehicleReportShell
        title="Veículos indisponíveis"
        description="Consulta operacional com o motivo da indisponibilidade e os vínculos ativos responsáveis pelo bloqueio."
        icon={FileWarning}
      >
        <FiltersGrid>
          <SearchField placeholder="Buscar por placa, placa especial, chassi ou RENAVAM" value={search} onChange={(value) => { setSearch(value); setPage(1); }} />
          <VehicleSelect value={vehicleId} onChange={(value) => { setVehicleId(value); setPage(1); }} />
          <ClearFiltersButton onClick={() => { setSearch(""); setVehicleId("all"); setPage(1); }} />
        </FiltersGrid>

        {reportQuery.isLoading ? (
          <LoadingCardList />
        ) : reportQuery.isError ? (
          <ErrorCard text="Não foi possível carregar os veículos indisponíveis." />
        ) : !reportQuery.data?.data.length ? (
          <EmptyCard text="Nenhum veículo indisponível encontrado." />
        ) : (
          <div className="space-y-4">
            <TableWrap headers={["Veículo", "Motivo", "Empréstimo", "Cautela", "Manutenção", "Locação"]}>
              {reportQuery.data.data.map((item) => (
                <tr key={item.vehicle.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">{formatVehicleLabel(item.vehicle)}</td>
                  <td className="px-4 py-4"><Badge variant="warning">{item.unavailability_reason}</Badge></td>
                  <td className="px-4 py-4 text-slate-700">{item.active_loan ? formatDate(item.active_loan.start_date) : "-"}</td>
                  <td className="px-4 py-4 text-slate-700">{item.active_custody ? formatDate(item.active_custody.start_date) : "-"}</td>
                  <td className="px-4 py-4 text-slate-700">{item.active_maintenance ? `${item.active_maintenance.workshop ?? "Sem oficina"} • ${formatDate(item.active_maintenance.entry_date)}` : "-"}</td>
                  <td className="px-4 py-4 text-slate-700">{item.active_rental ? `${item.active_rental.company ?? "Sem empresa"} • ${formatDate(item.active_rental.contract_end_date)}` : "-"}</td>
                </tr>
              ))}
            </TableWrap>
            <Pager data={reportQuery.data} onPageChange={setPage} disabled={reportQuery.isFetching} />
          </div>
        )}
      </VehicleReportShell>
    </VehicleReportsGuard>
  );
}

export function VehicleLoansReportPage() {
  return <VehicleLoanLikePage reportType="loans" title="Empréstimos" description="Histórico paginado de empréstimos de veículos." />;
}

export function VehicleActiveLoansReportPage() {
  return <VehicleLoanLikePage reportType="active-loans" title="Empréstimos ativos" description="Veículos atualmente em uso, com tomador e datas de saída." />;
}

function VehicleLoanLikePage({
  reportType,
  title,
  description,
}: {
  reportType: "loans" | "active-loans";
  title: string;
  description: string;
}) {
  const access = useVehicleReportsAccess();
  const [vehicleId, setVehicleId] = useState("all");
  const [loanStatus, setLoanStatus] = useState(reportType === "active-loans" ? "in_use" : "all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo<VehicleReportFilters>(
    () => ({
      page,
      per_page: 15,
      vehicle_id: vehicleId !== "all" ? Number(vehicleId) : undefined,
      loan_status: loanStatus !== "all" ? loanStatus as VehicleReportFilters["loan_status"] : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [dateFrom, dateTo, loanStatus, page, vehicleId],
  );

  const activeLoansQuery = useVehicleActiveLoansReport(
    filters,
    access.enabled && reportType === "active-loans",
  );
  const loansQuery = useVehicleLoansReport(
    filters,
    access.enabled && reportType === "loans",
  );
  const reportQuery = reportType === "active-loans" ? activeLoansQuery : loansQuery;

  return (
    <VehicleReportsGuard>
      <VehicleReportShell title={title} description={description} icon={Shield}>
        <FiltersGrid>
          <VehicleSelect value={vehicleId} onChange={(value) => { setVehicleId(value); setPage(1); }} />
          <LoanStatusSelect value={loanStatus} onChange={(value) => { setLoanStatus(value); setPage(1); }} />
          <DateField label="Data inicial" value={dateFrom} onChange={(value) => { setDateFrom(value); setPage(1); }} />
          <DateField label="Data final" value={dateTo} onChange={(value) => { setDateTo(value); setPage(1); }} />
          <ClearFiltersButton onClick={() => { setVehicleId("all"); setLoanStatus(reportType === "active-loans" ? "in_use" : "all"); setDateFrom(""); setDateTo(""); setPage(1); }} />
        </FiltersGrid>

        {reportQuery.isLoading ? (
          <LoadingCardList />
        ) : reportQuery.isError ? (
          <ErrorCard text="Não foi possível carregar o relatório de empréstimos." />
        ) : !reportQuery.data?.data.length ? (
          <EmptyCard text="Nenhum empréstimo encontrado." />
        ) : (
          <div className="space-y-4">
            <TableWrap headers={["Veículo", "Tomador", "Saída", "Devolução", "Status", "KM"]}>
              {reportQuery.data.data.map((item) => (
                <tr key={item.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">{formatVehicleLabel(item.vehicle)}</td>
                  <td className="px-4 py-4 text-slate-700">{getVehicleLoanBorrowerLabel(item)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatDate(item.start_date)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatDate(item.end_date)}</td>
                  <td className="px-4 py-4"><Badge variant={getVehicleLoanStatusVariant(item.status)}>{item.status_label ?? "-"}</Badge></td>
                  <td className="px-4 py-4 text-slate-700">{formatNumber(item.start_km)}{item.end_km ? ` -> ${formatNumber(item.end_km)}` : ""}</td>
                </tr>
              ))}
            </TableWrap>
            <Pager data={reportQuery.data} onPageChange={setPage} disabled={reportQuery.isFetching} />
          </div>
        )}
      </VehicleReportShell>
    </VehicleReportsGuard>
  );
}

export function VehicleActiveCustodiesReportPage() {
  const access = useVehicleReportsAccess();
  const [vehicleId, setVehicleId] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo<VehicleReportFilters>(
    () => ({
      page,
      per_page: 15,
      vehicle_id: vehicleId !== "all" ? Number(vehicleId) : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [dateFrom, dateTo, page, vehicleId],
  );

  const reportQuery = useVehicleActiveCustodiesReport(filters, access.enabled);

  return (
    <VehicleReportsGuard>
      <VehicleReportShell
        title="Cautelas ativas"
        description="Consulta operacional dos veículos cautelados e de seus respectivos custodiante."
        icon={Shield}
      >
        <FiltersGrid>
          <VehicleSelect value={vehicleId} onChange={(value) => { setVehicleId(value); setPage(1); }} />
          <DateField label="Data inicial" value={dateFrom} onChange={(value) => { setDateFrom(value); setPage(1); }} />
          <DateField label="Data final" value={dateTo} onChange={(value) => { setDateTo(value); setPage(1); }} />
          <ClearFiltersButton onClick={() => { setVehicleId("all"); setDateFrom(""); setDateTo(""); setPage(1); }} />
        </FiltersGrid>

        {reportQuery.isLoading ? (
          <LoadingCardList />
        ) : reportQuery.isError ? (
          <ErrorCard text="Não foi possível carregar as cautelas ativas." />
        ) : !reportQuery.data?.data.length ? (
          <EmptyCard text="Nenhuma cautela ativa encontrada." />
        ) : (
          <div className="space-y-4">
            <TableWrap headers={["Veículo", "Custodiante", "Documento", "Início", "Fim previsto", "Status"]}>
              {reportQuery.data.data.map((item) => (
                <tr key={item.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">{formatVehicleLabel(item.vehicle)}</td>
                  <td className="px-4 py-4 text-slate-700">{getVehicleCustodyCustodianLabel(item)}</td>
                  <td className="px-4 py-4 text-slate-700">{item.document_number ?? "-"}</td>
                  <td className="px-4 py-4 text-slate-700">{formatDate(item.start_date)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatDate(item.end_date)}</td>
                  <td className="px-4 py-4"><Badge variant={getVehicleCustodyStatusVariant(item.status)}>{item.status_label ?? "-"}</Badge></td>
                </tr>
              ))}
            </TableWrap>
            <Pager data={reportQuery.data} onPageChange={setPage} disabled={reportQuery.isFetching} />
          </div>
        )}
      </VehicleReportShell>
    </VehicleReportsGuard>
  );
}

export function VehicleMaintenancesReportPage() {
  const access = useVehicleReportsAccess();
  const [vehicleId, setVehicleId] = useState("all");
  const [workshopId, setWorkshopId] = useState("all");
  const [maintenanceStatus, setMaintenanceStatus] = useState("all");
  const [maintenanceType, setMaintenanceType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo<VehicleReportFilters>(
    () => ({
      page,
      per_page: 15,
      vehicle_id: vehicleId !== "all" ? Number(vehicleId) : undefined,
      workshop_id: workshopId !== "all" ? Number(workshopId) : undefined,
      maintenance_status: maintenanceStatus !== "all" ? maintenanceStatus as VehicleReportFilters["maintenance_status"] : undefined,
      maintenance_type: maintenanceType !== "all" ? maintenanceType as VehicleReportFilters["maintenance_type"] : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [dateFrom, dateTo, maintenanceStatus, maintenanceType, page, vehicleId, workshopId],
  );

  const reportQuery = useVehicleMaintenancesReport(filters, access.enabled);

  return (
    <VehicleReportsGuard>
      <VehicleReportShell
        title="Manutenções"
        description="Acompanhamento operacional das ordens de manutenção por veículo, oficina, tipo e status."
        icon={Wrench}
      >
        <FiltersGrid>
          <VehicleSelect value={vehicleId} onChange={(value) => { setVehicleId(value); setPage(1); }} />
          <WorkshopSelect value={workshopId} onChange={(value) => { setWorkshopId(value); setPage(1); }} />
          <MaintenanceStatusSelect value={maintenanceStatus} onChange={(value) => { setMaintenanceStatus(value); setPage(1); }} />
          <MaintenanceTypeSelect value={maintenanceType} onChange={(value) => { setMaintenanceType(value); setPage(1); }} />
          <DateField label="Data inicial" value={dateFrom} onChange={(value) => { setDateFrom(value); setPage(1); }} />
          <DateField label="Data final" value={dateTo} onChange={(value) => { setDateTo(value); setPage(1); }} />
          <ClearFiltersButton onClick={() => { setVehicleId("all"); setWorkshopId("all"); setMaintenanceStatus("all"); setMaintenanceType("all"); setDateFrom(""); setDateTo(""); setPage(1); }} />
        </FiltersGrid>

        {reportQuery.isLoading ? (
          <LoadingCardList />
        ) : reportQuery.isError ? (
          <ErrorCard text="Não foi possível carregar as manutenções." />
        ) : !reportQuery.data?.data.length ? (
          <EmptyCard text="Nenhuma manutenção encontrada." />
        ) : (
          <div className="space-y-4">
            <TableWrap headers={["Veículo", "Oficina", "Tipo", "Entrada", "Previsão", "Status", "Custo"]}>
              {reportQuery.data.data.map((item) => (
                <tr key={item.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">{formatVehicleLabel(item.vehicle)}</td>
                  <td className="px-4 py-4 text-slate-700">{item.workshop?.name ?? "-"}</td>
                  <td className="px-4 py-4 text-slate-700">{item.maintenance_type_label ?? "-"}</td>
                  <td className="px-4 py-4 text-slate-700">{formatDate(item.entry_date)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatDate(item.expected_completion_date)}</td>
                  <td className="px-4 py-4"><Badge variant={getVehicleMaintenanceStatusVariant(item.status)}>{item.status_label ?? "-"}</Badge></td>
                  <td className="px-4 py-4 text-slate-700">{formatCurrency(item.cost)}</td>
                </tr>
              ))}
            </TableWrap>
            <Pager data={reportQuery.data} onPageChange={setPage} disabled={reportQuery.isFetching} />
          </div>
        )}
      </VehicleReportShell>
    </VehicleReportsGuard>
  );
}

export function VehicleFuelingsReportPage() {
  const access = useVehicleReportsAccess();
  const [vehicleId, setVehicleId] = useState("all");
  const [fuelType, setFuelType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo<VehicleReportFilters>(
    () => ({
      page,
      per_page: 15,
      vehicle_id: vehicleId !== "all" ? Number(vehicleId) : undefined,
      fuel_type: fuelType !== "all" ? fuelType as VehicleReportFilters["fuel_type"] : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [dateFrom, dateTo, fuelType, page, vehicleId],
  );

  const reportQuery = useVehicleFuelingsReport(filters, access.enabled);

  return (
    <VehicleReportsGuard>
      <VehicleReportShell
        title="Abastecimentos"
        description="Histórico de abastecimentos com litros, valor, posto, quilometragem e contexto operacional."
        icon={Fuel}
      >
        <FiltersGrid>
          <VehicleSelect value={vehicleId} onChange={(value) => { setVehicleId(value); setPage(1); }} />
          <FuelTypeSelect value={fuelType} onChange={(value) => { setFuelType(value); setPage(1); }} />
          <DateField label="Data inicial" value={dateFrom} onChange={(value) => { setDateFrom(value); setPage(1); }} />
          <DateField label="Data final" value={dateTo} onChange={(value) => { setDateTo(value); setPage(1); }} />
          <ClearFiltersButton onClick={() => { setVehicleId("all"); setFuelType("all"); setDateFrom(""); setDateTo(""); setPage(1); }} />
        </FiltersGrid>

        {reportQuery.isLoading ? (
          <LoadingCardList />
        ) : reportQuery.isError ? (
          <ErrorCard text="Não foi possível carregar os abastecimentos." />
        ) : !reportQuery.data?.data.length ? (
          <EmptyCard text="Nenhum abastecimento encontrado." />
        ) : (
          <div className="space-y-4">
            <TableWrap headers={["Veículo", "Data", "Combustível", "Litros", "Custo", "KM", "Contexto"]}>
              {reportQuery.data.data.map((item) => (
                <tr key={item.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">{formatVehicleLabel(item.vehicle)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatDate(item.fueling_date)}</td>
                  <td className="px-4 py-4"><Badge variant={getVehicleFuelTypeVariant(item.fuel_type)}>{item.fuel_type_label ?? item.fuel_type}</Badge></td>
                  <td className="px-4 py-4 text-slate-700">{formatNumber(item.liters, 2)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatCurrency(item.total_cost)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatNumber(item.km)}</td>
                  <td className="px-4 py-4 text-slate-700">{getVehicleFuelingContextLabel(item)}</td>
                </tr>
              ))}
            </TableWrap>
            <Pager data={reportQuery.data} onPageChange={setPage} disabled={reportQuery.isFetching} />
          </div>
        )}
      </VehicleReportShell>
    </VehicleReportsGuard>
  );
}

export function VehicleDamagesReportPage() {
  const access = useVehicleReportsAccess();
  const [vehicleId, setVehicleId] = useState("all");
  const [damageStatus, setDamageStatus] = useState("all");
  const [damageSeverity, setDamageSeverity] = useState("all");
  const [damageType, setDamageType] = useState("all");
  const [detectionMoment, setDetectionMoment] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo<VehicleReportFilters>(
    () => ({
      page,
      per_page: 15,
      vehicle_id: vehicleId !== "all" ? Number(vehicleId) : undefined,
      damage_status: damageStatus !== "all" ? damageStatus as VehicleReportFilters["damage_status"] : undefined,
      damage_severity: damageSeverity !== "all" ? damageSeverity as VehicleReportFilters["damage_severity"] : undefined,
      damage_type: damageType !== "all" ? damageType as VehicleReportFilters["damage_type"] : undefined,
      detection_moment: detectionMoment !== "all" ? detectionMoment as VehicleReportFilters["detection_moment"] : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [damageSeverity, damageStatus, damageType, dateFrom, dateTo, detectionMoment, page, vehicleId],
  );

  const reportQuery = useVehicleDamagesReport(filters, access.enabled);

  return (
    <VehicleReportsGuard>
      <VehicleReportShell
        title="Avarias"
        description="Relatório operacional de avarias com resumo gerencial por gravidade e status de reparo."
        icon={FileWarning}
      >
        <FiltersGrid>
          <VehicleSelect value={vehicleId} onChange={(value) => { setVehicleId(value); setPage(1); }} />
          <DamageStatusSelect value={damageStatus} onChange={(value) => { setDamageStatus(value); setPage(1); }} />
          <DamageSeveritySelect value={damageSeverity} onChange={(value) => { setDamageSeverity(value); setPage(1); }} />
          <DamageTypeSelect value={damageType} onChange={(value) => { setDamageType(value); setPage(1); }} />
          <DetectionMomentSelect value={detectionMoment} onChange={(value) => { setDetectionMoment(value); setPage(1); }} />
          <DateField label="Data inicial" value={dateFrom} onChange={(value) => { setDateFrom(value); setPage(1); }} />
          <DateField label="Data final" value={dateTo} onChange={(value) => { setDateTo(value); setPage(1); }} />
          <ClearFiltersButton onClick={() => { setVehicleId("all"); setDamageStatus("all"); setDamageSeverity("all"); setDamageType("all"); setDetectionMoment("all"); setDateFrom(""); setDateTo(""); setPage(1); }} />
        </FiltersGrid>

        {reportQuery.isLoading ? (
          <LoadingCardList />
        ) : reportQuery.isError ? (
          <ErrorCard text="Não foi possível carregar as avarias." />
        ) : !reportQuery.data?.data.length ? (
          <EmptyCard text="Nenhuma avaria encontrada." />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-3">
              {(reportQuery.data.summary ?? []).map((item, index) => (
                <SummaryMetric
                  key={`${item.severity?.value ?? "severity"}-${item.status?.value ?? "status"}-${index}`}
                  label={`${item.severity?.label ?? "Sem gravidade"} • ${item.status?.label ?? "Sem status"}`}
                  value={`${formatNumber(item.total_damages)} avaria(s)`}
                />
              ))}
            </div>

            <TableWrap headers={["Veículo", "Tipo", "Gravidade", "Status", "Detecção", "Custos", "Contexto"]}>
              {reportQuery.data.data.map((item) => (
                <tr key={item.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">{formatVehicleLabel(item.vehicle)}</td>
                  <td className="px-4 py-4 text-slate-700">{item.damage_type_label ?? "-"}</td>
                  <td className="px-4 py-4"><Badge variant={getVehicleDamageSeverityVariant(item.severity)}>{item.severity_label ?? "-"}</Badge></td>
                  <td className="px-4 py-4"><Badge variant={getVehicleDamageStatusVariant(item.status)}>{item.status_label ?? "-"}</Badge></td>
                  <td className="px-4 py-4 text-slate-700">{item.detection_moment_label ?? "-"}<p className="text-xs text-slate-500">{formatDate(item.detected_date)}</p></td>
                  <td className="px-4 py-4 text-slate-700">{formatCurrency(item.estimated_repair_cost)}<p className="text-xs text-slate-500">Real: {formatCurrency(item.actual_repair_cost)}</p></td>
                  <td className="px-4 py-4 text-slate-700">{getVehicleDamageContextLabel(item)}</td>
                </tr>
              ))}
            </TableWrap>
            <Pager data={reportQuery.data} onPageChange={setPage} disabled={reportQuery.isFetching} />
          </div>
        )}
      </VehicleReportShell>
    </VehicleReportsGuard>
  );
}

export function VehicleRentalsReportPage() {
  return <VehicleRentalLikePage reportType="rentals" title="Locações" description="Consulta paginada dos contratos de locação por empresa, status e período." />;
}

export function VehicleExpiringRentalsReportPage() {
  return <VehicleRentalLikePage reportType="expiring-rentals" title="Locações a vencer" description="Contratos ativos com vencimento próximo para acompanhamento preventivo." />;
}

function VehicleRentalLikePage({
  reportType,
  title,
  description,
}: {
  reportType: "rentals" | "expiring-rentals";
  title: string;
  description: string;
}) {
  const access = useVehicleReportsAccess();
  const [vehicleId, setVehicleId] = useState("all");
  const [companyId, setCompanyId] = useState("all");
  const [rentalStatus, setRentalStatus] = useState(reportType === "expiring-rentals" ? "active" : "all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo<VehicleReportFilters>(
    () => ({
      page,
      per_page: 15,
      vehicle_id: vehicleId !== "all" ? Number(vehicleId) : undefined,
      company_id: companyId !== "all" ? Number(companyId) : undefined,
      rental_status: rentalStatus !== "all" ? rentalStatus as VehicleReportFilters["rental_status"] : undefined,
      ...(reportType === "expiring-rentals"
        ? {
            contract_end_from: dateFrom || undefined,
            contract_end_to: dateTo || undefined,
          }
        : {
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
          }),
    }),
    [companyId, dateFrom, dateTo, page, rentalStatus, reportType, vehicleId],
  );

  const expiringRentalsQuery = useVehicleExpiringRentalsReport(
    filters,
    access.enabled && reportType === "expiring-rentals",
  );
  const rentalsQuery = useVehicleRentalsReport(
    filters,
    access.enabled && reportType === "rentals",
  );
  const reportQuery = reportType === "expiring-rentals" ? expiringRentalsQuery : rentalsQuery;

  return (
    <VehicleReportsGuard>
      <VehicleReportShell title={title} description={description} icon={CarFront}>
        <FiltersGrid>
          <VehicleSelect value={vehicleId} onChange={(value) => { setVehicleId(value); setPage(1); }} />
          <CompanySelect value={companyId} onChange={(value) => { setCompanyId(value); setPage(1); }} />
          <RentalStatusSelect value={rentalStatus} onChange={(value) => { setRentalStatus(value); setPage(1); }} />
          <DateField label={reportType === "expiring-rentals" ? "Vencimento inicial" : "Data inicial"} value={dateFrom} onChange={(value) => { setDateFrom(value); setPage(1); }} />
          <DateField label={reportType === "expiring-rentals" ? "Vencimento final" : "Data final"} value={dateTo} onChange={(value) => { setDateTo(value); setPage(1); }} />
          <ClearFiltersButton onClick={() => { setVehicleId("all"); setCompanyId("all"); setRentalStatus(reportType === "expiring-rentals" ? "active" : "all"); setDateFrom(""); setDateTo(""); setPage(1); }} />
        </FiltersGrid>

        {reportQuery.isLoading ? (
          <LoadingCardList />
        ) : reportQuery.isError ? (
          <ErrorCard text="Não foi possível carregar as locações." />
        ) : !reportQuery.data?.data.length ? (
          <EmptyCard text="Nenhuma locação encontrada." />
        ) : (
          <div className="space-y-4">
            <TableWrap headers={["Veículo", "Empresa", "Contrato", "Início", "Término", "Status", "Custo mensal"]}>
              {reportQuery.data.data.map((item) => (
                <tr key={item.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">{formatVehicleLabel(item.vehicle)}</td>
                  <td className="px-4 py-4 text-slate-700">{item.company?.trade_name ?? item.company?.name ?? "-"}</td>
                  <td className="px-4 py-4 text-slate-700">{item.contract_number ?? "-"}</td>
                  <td className="px-4 py-4 text-slate-700">{formatDate(item.contract_start_date)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatDate(item.contract_end_date)}</td>
                  <td className="px-4 py-4"><Badge variant={getVehicleRentalStatusVariant(item.status)}>{item.status_label ?? "-"}</Badge></td>
                  <td className="px-4 py-4 text-slate-700">{formatCurrency(item.monthly_cost)}</td>
                </tr>
              ))}
            </TableWrap>
            <Pager data={reportQuery.data} onPageChange={setPage} disabled={reportQuery.isFetching} />
          </div>
        )}
      </VehicleReportShell>
    </VehicleReportsGuard>
  );
}

export function VehiclePanelReportPage() {
  const access = useVehicleReportsAccess(true);
  const params = useParams<{ id: string }>();
  const reportQuery = useVehiclePanelReport(params.id, access.enabled);

  return (
    <VehicleReportsGuard requireView>
      <VehicleReportShell
        title="Painel consolidado do veículo"
        description="Visão única do veículo com uso atual, histórico de empréstimos, cautelas, manutenções, abastecimentos, avarias e locações."
        icon={CarFront}
      >
        {reportQuery.isLoading ? (
          <LoadingCardList count={6} />
        ) : reportQuery.isError || !reportQuery.data?.data ? (
          <ErrorCard text="Não foi possível carregar o painel consolidado do veículo." />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 xl:grid-cols-3">
              <VehicleMiniStat icon="vehicle" label="Veículo" value={formatVehicleLabel(reportQuery.data.data.vehicle)} />
              <VehicleMiniStat icon="maintenance" label="KM atual" value={formatNumber(reportQuery.data.data.vehicle.current_km)} />
              <VehicleMiniStat icon="company" label="Subunidade" value={reportQuery.data.data.vehicle.subunit?.name ?? "-"} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <SummaryMetric label="Empréstimos" value={formatNumber(reportQuery.data.data.summary.total_loans)} />
              <SummaryMetric label="Cautelas" value={formatNumber(reportQuery.data.data.summary.total_custodies)} />
              <SummaryMetric label="Manutenções" value={formatNumber(reportQuery.data.data.summary.total_maintenances)} />
              <SummaryMetric label="Abastecimentos" value={formatNumber(reportQuery.data.data.summary.total_fuelings)} />
              <SummaryMetric label="Avarias" value={formatNumber(reportQuery.data.data.summary.total_damages)} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryMetric label="Custo manutenção" value={formatCurrency(reportQuery.data.data.summary.total_maintenance_cost)} />
              <SummaryMetric label="Custo abastecimento" value={formatCurrency(reportQuery.data.data.summary.total_fueling_cost)} />
              <SummaryMetric label="Custo estimado avarias" value={formatCurrency(reportQuery.data.data.summary.total_estimated_damage_cost)} />
              <SummaryMetric label="Custo real avarias" value={formatCurrency(reportQuery.data.data.summary.total_actual_damage_cost)} />
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <TableWrap headers={["Contexto ativo", "Detalhes"]}>
                <tr className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">Empréstimo ativo</td>
                  <td className="px-4 py-4 text-slate-700">{reportQuery.data.data.active_loan ? `${getVehicleLoanBorrowerLabel(reportQuery.data.data.active_loan)} • ${formatDate(reportQuery.data.data.active_loan.start_date)}` : "Nenhum"}</td>
                </tr>
                <tr className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">Cautela ativa</td>
                  <td className="px-4 py-4 text-slate-700">{reportQuery.data.data.active_custody ? `${getVehicleCustodyCustodianLabel(reportQuery.data.data.active_custody)} • ${formatDate(reportQuery.data.data.active_custody.start_date)}` : "Nenhuma"}</td>
                </tr>
                <tr className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">Manutenção ativa</td>
                  <td className="px-4 py-4 text-slate-700">{reportQuery.data.data.active_maintenance ? `${reportQuery.data.data.active_maintenance.workshop?.name ?? "Sem oficina"} • ${formatDate(reportQuery.data.data.active_maintenance.entry_date)}` : "Nenhuma"}</td>
                </tr>
                <tr className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">Locação ativa</td>
                  <td className="px-4 py-4 text-slate-700">{reportQuery.data.data.active_rental ? `${reportQuery.data.data.active_rental.company?.trade_name ?? reportQuery.data.data.active_rental.company?.name ?? "Sem empresa"} • ${formatDate(reportQuery.data.data.active_rental.contract_end_date)}` : "Nenhuma"}</td>
                </tr>
              </TableWrap>

              <TableWrap headers={["Histórico", "Quantidade"]}>
                <tr className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">Locações registradas</td>
                  <td className="px-4 py-4 text-slate-700">{formatNumber(reportQuery.data.data.summary.total_rentals)}</td>
                </tr>
                <tr className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">Empréstimos registrados</td>
                  <td className="px-4 py-4 text-slate-700">{formatNumber(reportQuery.data.data.summary.total_loans)}</td>
                </tr>
                <tr className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">Cautelas registradas</td>
                  <td className="px-4 py-4 text-slate-700">{formatNumber(reportQuery.data.data.summary.total_custodies)}</td>
                </tr>
                <tr className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">Abastecimentos registrados</td>
                  <td className="px-4 py-4 text-slate-700">{formatNumber(reportQuery.data.data.summary.total_fuelings)}</td>
                </tr>
              </TableWrap>
            </div>

            <TableWrap headers={["Últimos empréstimos", "Tomador", "Saída", "Status"]}>
              {reportQuery.data.data.loans.slice(0, 5).map((item) => (
                <tr key={item.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">{formatVehicleLabel(item.vehicle)}</td>
                  <td className="px-4 py-4 text-slate-700">{getVehicleLoanBorrowerLabel(item)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatDate(item.start_date)}</td>
                  <td className="px-4 py-4"><Badge variant={getVehicleLoanStatusVariant(item.status)}>{item.status_label ?? "-"}</Badge></td>
                </tr>
              ))}
            </TableWrap>

            <TableWrap headers={["Últimas manutenções", "Oficina", "Entrada", "Status", "Custo"]}>
              {reportQuery.data.data.maintenances.slice(0, 5).map((item) => (
                <tr key={item.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">{item.description}</td>
                  <td className="px-4 py-4 text-slate-700">{item.workshop?.name ?? "-"}</td>
                  <td className="px-4 py-4 text-slate-700">{formatDate(item.entry_date)}</td>
                  <td className="px-4 py-4"><Badge variant={getVehicleMaintenanceStatusVariant(item.status)}>{item.status_label ?? "-"}</Badge></td>
                  <td className="px-4 py-4 text-slate-700">{formatCurrency(item.cost)}</td>
                </tr>
              ))}
            </TableWrap>

            <TableWrap headers={["Últimos abastecimentos", "Data", "Litros", "Custo", "Contexto"]}>
              {reportQuery.data.data.fuelings.slice(0, 5).map((item) => (
                <tr key={item.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">{formatDate(item.fueling_date)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatDate(item.fueling_date)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatNumber(item.liters, 2)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatCurrency(item.total_cost)}</td>
                  <td className="px-4 py-4 text-slate-700">{getVehicleFuelingContextLabel(item)}</td>
                </tr>
              ))}
            </TableWrap>
          </div>
        )}
      </VehicleReportShell>
    </VehicleReportsGuard>
  );
}
