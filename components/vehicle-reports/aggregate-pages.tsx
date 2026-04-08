"use client";

import { BarChart3, CarFront, Droplets, Wrench } from "lucide-react";
import { useMemo, useState } from "react";

import {
  useVehicleFleetCompositionReport,
  useVehicleFleetStatusReport,
  useVehicleFuelCostsReport,
  useVehicleMaintenanceCostsReport,
} from "@/hooks/use-vehicle-reports";
import type { VehicleReportFilters } from "@/types/vehicle-report.type";
import {
  AssignedUserSelect,
  ClearFiltersButton,
  DateField,
  EmptyCard,
  ErrorCard,
  FiltersGrid,
  formatCurrency,
  formatNumber,
  FuelTypeSelect,
  LoadingCardList,
  MaintenanceStatusSelect,
  MaintenanceTypeSelect,
  OperationalStatusSelect,
  OwnershipTypeSelect,
  SearchField,
  SubunitSelect,
  SummaryMetric,
  TableWrap,
  useVehicleReportsAccess,
  VehicleReportShell,
  VehicleReportsGuard,
  VehicleSelect,
  VehicleTypeSelect,
  VariantSelect,
  WorkshopSelect,
  CompanySelect,
} from "@/components/vehicle-reports/shared";

function useFleetFilters() {
  const [search, setSearch] = useState("");
  const [vehicleTypeId, setVehicleTypeId] = useState("all");
  const [variantId, setVariantId] = useState("all");
  const [subunitId, setSubunitId] = useState("all");
  const [assignedUserId, setAssignedUserId] = useState("all");
  const [operationalStatus, setOperationalStatus] = useState("all");
  const [ownershipType, setOwnershipType] = useState("all");

  const filters = useMemo<VehicleReportFilters>(
    () => ({
      search: search || undefined,
      vehicle_type_id: vehicleTypeId !== "all" ? Number(vehicleTypeId) : undefined,
      variant_id: variantId !== "all" ? Number(variantId) : undefined,
      subunit_id: subunitId !== "all" ? Number(subunitId) : undefined,
      assigned_to_user_id: assignedUserId !== "all" ? Number(assignedUserId) : undefined,
      operational_status: operationalStatus !== "all" ? operationalStatus as VehicleReportFilters["operational_status"] : undefined,
      ownership_type: ownershipType !== "all" ? ownershipType as VehicleReportFilters["ownership_type"] : undefined,
    }),
    [assignedUserId, operationalStatus, ownershipType, search, subunitId, variantId, vehicleTypeId],
  );

  return {
    search,
    vehicleTypeId,
    variantId,
    subunitId,
    assignedUserId,
    operationalStatus,
    ownershipType,
    setSearch,
    setVehicleTypeId,
    setVariantId,
    setSubunitId,
    setAssignedUserId,
    setOperationalStatus,
    setOwnershipType,
    filters,
    clear() {
      setSearch("");
      setVehicleTypeId("all");
      setVariantId("all");
      setSubunitId("all");
      setAssignedUserId("all");
      setOperationalStatus("all");
      setOwnershipType("all");
    },
  };
}

export function VehicleFleetStatusReportPage() {
  const access = useVehicleReportsAccess();
  const state = useFleetFilters();
  const reportQuery = useVehicleFleetStatusReport(state.filters, access.enabled);

  const totals = useMemo(() => {
    const items = reportQuery.data?.data ?? [];

    return {
      totalVehicles: items.reduce((sum, item) => sum + item.total_vehicles, 0),
      totalOwned: items.reduce((sum, item) => sum + item.owned_vehicles, 0),
      totalRented: items.reduce((sum, item) => sum + item.rented_vehicles, 0),
      totalArmored: items.reduce((sum, item) => sum + item.armored_vehicles, 0),
    };
  }, [reportQuery.data?.data]);

  return (
    <VehicleReportsGuard>
      <VehicleReportShell
        title="Frota por status"
        description="Leitura consolidada da frota por status operacional, posse, blindagem e aptidão para viagem."
        icon={BarChart3}
      >
        <FiltersGrid>
          <SearchField placeholder="Buscar por placa, placa especial, chassi ou RENAVAM" value={state.search} onChange={state.setSearch} />
          <VehicleTypeSelect value={state.vehicleTypeId} onChange={state.setVehicleTypeId} />
          <VariantSelect value={state.variantId} onChange={state.setVariantId} />
          <SubunitSelect value={state.subunitId} onChange={state.setSubunitId} />
          <AssignedUserSelect value={state.assignedUserId} onChange={state.setAssignedUserId} />
          <OperationalStatusSelect value={state.operationalStatus} onChange={state.setOperationalStatus} />
          <OwnershipTypeSelect value={state.ownershipType} onChange={state.setOwnershipType} />
          <ClearFiltersButton onClick={state.clear} />
        </FiltersGrid>

        {reportQuery.isLoading ? (
          <LoadingCardList count={4} />
        ) : reportQuery.isError ? (
          <ErrorCard text="Não foi possível carregar o relatório de frota por status." />
        ) : !reportQuery.data?.data.length ? (
          <EmptyCard text="Nenhum agrupamento encontrado para os filtros informados." />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryMetric label="Total da frota" value={formatNumber(totals.totalVehicles)} />
              <SummaryMetric label="Veículos próprios" value={formatNumber(totals.totalOwned)} />
              <SummaryMetric label="Veículos locados" value={formatNumber(totals.totalRented)} />
              <SummaryMetric label="Blindados" value={formatNumber(totals.totalArmored)} />
            </div>

            <TableWrap headers={["Status", "Total", "Próprios", "Locados", "Blindados", "Aptos para viagem"]}>
              {reportQuery.data.data.map((item) => (
                <tr key={item.status.value} className="border-t border-slate-200/70">
                  <td className="px-4 py-4 font-medium text-slate-900">{item.status.label}</td>
                  <td className="px-4 py-4 text-slate-700">{formatNumber(item.total_vehicles)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatNumber(item.owned_vehicles)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatNumber(item.rented_vehicles)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatNumber(item.armored_vehicles)}</td>
                  <td className="px-4 py-4 text-slate-700">{formatNumber(item.available_for_trip_vehicles)}</td>
                </tr>
              ))}
            </TableWrap>
          </div>
        )}
      </VehicleReportShell>
    </VehicleReportsGuard>
  );
}

export function VehicleFleetCompositionReportPage() {
  const access = useVehicleReportsAccess();
  const state = useFleetFilters();
  const reportQuery = useVehicleFleetCompositionReport(state.filters, access.enabled);

  return (
    <VehicleReportsGuard>
      <VehicleReportShell
        title="Composição da frota"
        description="Distribuição da frota por tipo e variante, com leitura de veículos ativos e composição própria ou locada."
        icon={CarFront}
      >
        <FiltersGrid>
          <SearchField placeholder="Buscar por placa, placa especial, chassi ou RENAVAM" value={state.search} onChange={state.setSearch} />
          <VehicleTypeSelect value={state.vehicleTypeId} onChange={state.setVehicleTypeId} />
          <VariantSelect value={state.variantId} onChange={state.setVariantId} />
          <SubunitSelect value={state.subunitId} onChange={state.setSubunitId} />
          <AssignedUserSelect value={state.assignedUserId} onChange={state.setAssignedUserId} />
          <OperationalStatusSelect value={state.operationalStatus} onChange={state.setOperationalStatus} />
          <OwnershipTypeSelect value={state.ownershipType} onChange={state.setOwnershipType} />
          <ClearFiltersButton onClick={state.clear} />
        </FiltersGrid>

        {reportQuery.isLoading ? (
          <LoadingCardList count={4} />
        ) : reportQuery.isError ? (
          <ErrorCard text="Não foi possível carregar a composição da frota." />
        ) : !reportQuery.data?.data.length ? (
          <EmptyCard text="Nenhuma composição encontrada para os filtros informados." />
        ) : (
          <TableWrap headers={["Tipo", "Variante", "Total", "Próprios", "Locados", "Ativos"]}>
            {reportQuery.data.data.map((item, index) => (
              <tr key={`${item.vehicle_type.id ?? "type"}-${item.variant.id ?? "variant"}-${index}`} className="border-t border-slate-200/70">
                <td className="px-4 py-4 font-medium text-slate-900">{item.vehicle_type.name}</td>
                <td className="px-4 py-4 text-slate-700">{item.variant.name}</td>
                <td className="px-4 py-4 text-slate-700">{formatNumber(item.total_vehicles)}</td>
                <td className="px-4 py-4 text-slate-700">{formatNumber(item.owned_vehicles)}</td>
                <td className="px-4 py-4 text-slate-700">{formatNumber(item.rented_vehicles)}</td>
                <td className="px-4 py-4 text-slate-700">{formatNumber(item.active_vehicles)}</td>
              </tr>
            ))}
          </TableWrap>
        )}
      </VehicleReportShell>
    </VehicleReportsGuard>
  );
}

export function VehicleMaintenanceCostsReportPage() {
  const access = useVehicleReportsAccess();
  const [vehicleId, setVehicleId] = useState("all");
  const [workshopId, setWorkshopId] = useState("all");
  const [maintenanceStatus, setMaintenanceStatus] = useState("all");
  const [maintenanceType, setMaintenanceType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filters = useMemo<VehicleReportFilters>(
    () => ({
      vehicle_id: vehicleId !== "all" ? Number(vehicleId) : undefined,
      workshop_id: workshopId !== "all" ? Number(workshopId) : undefined,
      maintenance_status: maintenanceStatus !== "all" ? maintenanceStatus as VehicleReportFilters["maintenance_status"] : undefined,
      maintenance_type: maintenanceType !== "all" ? maintenanceType as VehicleReportFilters["maintenance_type"] : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [dateFrom, dateTo, maintenanceStatus, maintenanceType, vehicleId, workshopId],
  );

  const reportQuery = useVehicleMaintenanceCostsReport(filters, access.enabled);

  return (
    <VehicleReportsGuard>
      <VehicleReportShell
        title="Custos de manutenção"
        description="Visão analítica por veículo com custo total, peças, mão de obra e frequência de manutenção preventiva e corretiva."
        icon={Wrench}
      >
        <FiltersGrid>
          <VehicleSelect value={vehicleId} onChange={setVehicleId} />
          <WorkshopSelect value={workshopId} onChange={setWorkshopId} />
          <MaintenanceStatusSelect value={maintenanceStatus} onChange={setMaintenanceStatus} />
          <MaintenanceTypeSelect value={maintenanceType} onChange={setMaintenanceType} />
          <DateField label="Data inicial" value={dateFrom} onChange={setDateFrom} />
          <DateField label="Data final" value={dateTo} onChange={setDateTo} />
          <ClearFiltersButton onClick={() => {
            setVehicleId("all");
            setWorkshopId("all");
            setMaintenanceStatus("all");
            setMaintenanceType("all");
            setDateFrom("");
            setDateTo("");
          }} />
        </FiltersGrid>

        {reportQuery.isLoading ? (
          <LoadingCardList count={3} />
        ) : reportQuery.isError ? (
          <ErrorCard text="Não foi possível carregar os custos de manutenção." />
        ) : !reportQuery.data?.data.length ? (
          <EmptyCard text="Nenhum custo de manutenção encontrado." />
        ) : (
          <TableWrap headers={["Veículo", "Qtd. manutenções", "Custo total", "Peças", "Mão de obra", "Preventivas", "Corretivas"]}>
            {reportQuery.data.data.map((item, index) => (
              <tr key={`${item.vehicle.id ?? "vehicle"}-${item.vehicle.license_plate ?? "plate"}-${index}`} className="border-t border-slate-200/70">
                <td className="px-4 py-4 font-medium text-slate-900">{[item.vehicle.license_plate, item.vehicle.vehicle_type, item.vehicle.variant].filter(Boolean).join(" • ")}</td>
                <td className="px-4 py-4 text-slate-700">{formatNumber(item.total_maintenances)}</td>
                <td className="px-4 py-4 text-slate-700">{formatCurrency(item.total_cost)}</td>
                <td className="px-4 py-4 text-slate-700">{formatCurrency(item.parts_cost)}</td>
                <td className="px-4 py-4 text-slate-700">{formatCurrency(item.labor_cost)}</td>
                <td className="px-4 py-4 text-slate-700">{formatNumber(item.preventive_count)}</td>
                <td className="px-4 py-4 text-slate-700">{formatNumber(item.corrective_count)}</td>
              </tr>
            ))}
          </TableWrap>
        )}
      </VehicleReportShell>
    </VehicleReportsGuard>
  );
}

export function VehicleFuelCostsReportPage() {
  const access = useVehicleReportsAccess();
  const [vehicleId, setVehicleId] = useState("all");
  const [companyId, setCompanyId] = useState("all");
  const [fuelType, setFuelType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filters = useMemo<VehicleReportFilters>(
    () => ({
      vehicle_id: vehicleId !== "all" ? Number(vehicleId) : undefined,
      company_id: companyId !== "all" ? Number(companyId) : undefined,
      fuel_type: fuelType !== "all" ? fuelType as VehicleReportFilters["fuel_type"] : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [companyId, dateFrom, dateTo, fuelType, vehicleId],
  );

  const reportQuery = useVehicleFuelCostsReport(filters, access.enabled);

  return (
    <VehicleReportsGuard>
      <VehicleReportShell
        title="Custos de abastecimento"
        description="Resumo por veículo com custo total, litros consumidos, faixa de quilometragem e preço médio por litro."
        icon={Droplets}
      >
        <FiltersGrid>
          <VehicleSelect value={vehicleId} onChange={setVehicleId} />
          <CompanySelect value={companyId} onChange={setCompanyId} />
          <FuelTypeSelect value={fuelType} onChange={setFuelType} />
          <DateField label="Data inicial" value={dateFrom} onChange={setDateFrom} />
          <DateField label="Data final" value={dateTo} onChange={setDateTo} />
          <ClearFiltersButton onClick={() => {
            setVehicleId("all");
            setCompanyId("all");
            setFuelType("all");
            setDateFrom("");
            setDateTo("");
          }} />
        </FiltersGrid>

        {reportQuery.isLoading ? (
          <LoadingCardList count={3} />
        ) : reportQuery.isError ? (
          <ErrorCard text="Não foi possível carregar os custos de abastecimento." />
        ) : !reportQuery.data?.data.length ? (
          <EmptyCard text="Nenhum custo de abastecimento encontrado." />
        ) : (
          <TableWrap headers={["Veículo", "Qtd. abastecimentos", "Litros", "Custo total", "Preço médio/L", "KM min", "KM máx"]}>
            {reportQuery.data.data.map((item, index) => (
              <tr key={`${item.vehicle.id ?? "vehicle"}-${item.vehicle.license_plate ?? "plate"}-${index}`} className="border-t border-slate-200/70">
                <td className="px-4 py-4 font-medium text-slate-900">{[item.vehicle.license_plate, item.vehicle.vehicle_type, item.vehicle.variant].filter(Boolean).join(" • ")}</td>
                <td className="px-4 py-4 text-slate-700">{formatNumber(item.total_fuelings)}</td>
                <td className="px-4 py-4 text-slate-700">{formatNumber(item.total_liters, 2)}</td>
                <td className="px-4 py-4 text-slate-700">{formatCurrency(item.total_cost)}</td>
                <td className="px-4 py-4 text-slate-700">{formatCurrency(item.average_price_per_liter)}</td>
                <td className="px-4 py-4 text-slate-700">{formatNumber(item.min_km)}</td>
                <td className="px-4 py-4 text-slate-700">{formatNumber(item.max_km)}</td>
              </tr>
            ))}
          </TableWrap>
        )}
      </VehicleReportShell>
    </VehicleReportsGuard>
  );
}
