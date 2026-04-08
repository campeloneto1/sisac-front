import { api } from "@/lib/api";
import type {
  CollectionVehicleReportResponse,
  VehicleAvailableReportResponse,
  VehicleCustodiesReportResponse,
  VehicleDamagesReportResponse,
  VehicleFleetCompositionItem,
  VehicleFleetStatusItem,
  VehicleFuelCostItem,
  VehicleFuelingsReportResponse,
  VehicleLoansReportResponse,
  VehicleMaintenancesReportResponse,
  VehicleMaintenanceCostItem,
  VehiclePanelResponse,
  VehicleRentalsReportResponse,
  VehicleReportFilters,
  VehicleUnavailableReportResponse,
} from "@/types/vehicle-report.type";

const basePath = "/vehicle-reports";

export const vehicleReportsService = {
  async fleetStatus(
    filters: VehicleReportFilters = {},
  ): Promise<CollectionVehicleReportResponse<VehicleFleetStatusItem>> {
    const { data } = await api.get<CollectionVehicleReportResponse<VehicleFleetStatusItem>>(
      `${basePath}/fleet-status`,
      { params: filters },
    );

    return data;
  },

  async fleetComposition(
    filters: VehicleReportFilters = {},
  ): Promise<CollectionVehicleReportResponse<VehicleFleetCompositionItem>> {
    const { data } = await api.get<CollectionVehicleReportResponse<VehicleFleetCompositionItem>>(
      `${basePath}/fleet-composition`,
      { params: filters },
    );

    return data;
  },

  async available(
    filters: VehicleReportFilters = {},
  ): Promise<VehicleAvailableReportResponse> {
    const { data } = await api.get<VehicleAvailableReportResponse>(
      `${basePath}/available`,
      { params: filters },
    );

    return data;
  },

  async unavailable(
    filters: VehicleReportFilters = {},
  ): Promise<VehicleUnavailableReportResponse> {
    const { data } = await api.get<VehicleUnavailableReportResponse>(
      `${basePath}/unavailable`,
      { params: filters },
    );

    return data;
  },

  async loans(
    filters: VehicleReportFilters = {},
  ): Promise<VehicleLoansReportResponse> {
    const { data } = await api.get<VehicleLoansReportResponse>(
      `${basePath}/loans`,
      { params: filters },
    );

    return data;
  },

  async activeLoans(
    filters: VehicleReportFilters = {},
  ): Promise<VehicleLoansReportResponse> {
    const { data } = await api.get<VehicleLoansReportResponse>(
      `${basePath}/active-loans`,
      { params: filters },
    );

    return data;
  },

  async activeCustodies(
    filters: VehicleReportFilters = {},
  ): Promise<VehicleCustodiesReportResponse> {
    const { data } = await api.get<VehicleCustodiesReportResponse>(
      `${basePath}/active-custodies`,
      { params: filters },
    );

    return data;
  },

  async maintenances(
    filters: VehicleReportFilters = {},
  ): Promise<VehicleMaintenancesReportResponse> {
    const { data } = await api.get<VehicleMaintenancesReportResponse>(
      `${basePath}/maintenances`,
      { params: filters },
    );

    return data;
  },

  async maintenanceCosts(
    filters: VehicleReportFilters = {},
  ): Promise<CollectionVehicleReportResponse<VehicleMaintenanceCostItem>> {
    const { data } = await api.get<CollectionVehicleReportResponse<VehicleMaintenanceCostItem>>(
      `${basePath}/maintenance-costs`,
      { params: filters },
    );

    return data;
  },

  async fuelings(
    filters: VehicleReportFilters = {},
  ): Promise<VehicleFuelingsReportResponse> {
    const { data } = await api.get<VehicleFuelingsReportResponse>(
      `${basePath}/fuelings`,
      { params: filters },
    );

    return data;
  },

  async fuelCosts(
    filters: VehicleReportFilters = {},
  ): Promise<CollectionVehicleReportResponse<VehicleFuelCostItem>> {
    const { data } = await api.get<CollectionVehicleReportResponse<VehicleFuelCostItem>>(
      `${basePath}/fuel-costs`,
      { params: filters },
    );

    return data;
  },

  async damages(
    filters: VehicleReportFilters = {},
  ): Promise<VehicleDamagesReportResponse> {
    const { data } = await api.get<VehicleDamagesReportResponse>(
      `${basePath}/damages`,
      { params: filters },
    );

    return data;
  },

  async rentals(
    filters: VehicleReportFilters = {},
  ): Promise<VehicleRentalsReportResponse> {
    const { data } = await api.get<VehicleRentalsReportResponse>(
      `${basePath}/rentals`,
      { params: filters },
    );

    return data;
  },

  async expiringRentals(
    filters: VehicleReportFilters = {},
  ): Promise<VehicleRentalsReportResponse> {
    const { data } = await api.get<VehicleRentalsReportResponse>(
      `${basePath}/expiring-rentals`,
      { params: filters },
    );

    return data;
  },

  async vehiclePanel(vehicleId: number | string): Promise<VehiclePanelResponse> {
    const { data } = await api.get<VehiclePanelResponse>(
      `${basePath}/vehicle-panel/${vehicleId}`,
    );

    return data;
  },
};
