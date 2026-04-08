import { api } from "@/lib/api";
import type {
  ArmamentAvailabilityItem,
  ArmamentBatchesReportResponse,
  ArmamentInventoryItem,
  ArmamentLoansReportResponse,
  ArmamentMovementsReportResponse,
  ArmamentOccurrencesReportResponse,
  ArmamentPanelResponse,
  ArmamentReportFilters,
  ArmamentUnitsReportResponse,
  CollectionArmamentReportResponse,
} from "@/types/armament-report.type";

const basePath = "/armament-reports";

export const armamentReportsService = {
  async inventory(filters: ArmamentReportFilters = {}): Promise<CollectionArmamentReportResponse<ArmamentInventoryItem>> {
    const { data } = await api.get<CollectionArmamentReportResponse<ArmamentInventoryItem>>(`${basePath}/inventory`, { params: filters });
    return data;
  },
  async availability(filters: ArmamentReportFilters = {}): Promise<CollectionArmamentReportResponse<ArmamentAvailabilityItem>> {
    const { data } = await api.get<CollectionArmamentReportResponse<ArmamentAvailabilityItem>>(`${basePath}/availability`, { params: filters });
    return data;
  },
  async availableUnits(filters: ArmamentReportFilters = {}): Promise<ArmamentUnitsReportResponse> {
    const { data } = await api.get<ArmamentUnitsReportResponse>(`${basePath}/available-units`, { params: filters });
    return data;
  },
  async availableBatches(filters: ArmamentReportFilters = {}): Promise<ArmamentBatchesReportResponse> {
    const { data } = await api.get<ArmamentBatchesReportResponse>(`${basePath}/available-batches`, { params: filters });
    return data;
  },
  async expiringUnits(filters: ArmamentReportFilters = {}): Promise<ArmamentUnitsReportResponse> {
    const { data } = await api.get<ArmamentUnitsReportResponse>(`${basePath}/expiring-units`, { params: filters });
    return data;
  },
  async expiringBatches(filters: ArmamentReportFilters = {}): Promise<ArmamentBatchesReportResponse> {
    const { data } = await api.get<ArmamentBatchesReportResponse>(`${basePath}/expiring-batches`, { params: filters });
    return data;
  },
  async loans(filters: ArmamentReportFilters = {}): Promise<ArmamentLoansReportResponse> {
    const { data } = await api.get<ArmamentLoansReportResponse>(`${basePath}/loans`, { params: filters });
    return data;
  },
  async activeLoans(filters: ArmamentReportFilters = {}): Promise<ArmamentLoansReportResponse> {
    const { data } = await api.get<ArmamentLoansReportResponse>(`${basePath}/active-loans`, { params: filters });
    return data;
  },
  async cautelas(filters: ArmamentReportFilters = {}): Promise<ArmamentLoansReportResponse> {
    const { data } = await api.get<ArmamentLoansReportResponse>(`${basePath}/cautelas`, { params: filters });
    return data;
  },
  async returnDivergences(filters: ArmamentReportFilters = {}): Promise<ArmamentLoansReportResponse> {
    const { data } = await api.get<ArmamentLoansReportResponse>(`${basePath}/return-divergences`, { params: filters });
    return data;
  },
  async movements(filters: ArmamentReportFilters = {}): Promise<ArmamentMovementsReportResponse> {
    const { data } = await api.get<ArmamentMovementsReportResponse>(`${basePath}/movements`, { params: filters });
    return data;
  },
  async occurrences(filters: ArmamentReportFilters = {}): Promise<ArmamentOccurrencesReportResponse> {
    const { data } = await api.get<ArmamentOccurrencesReportResponse>(`${basePath}/occurrences`, { params: filters });
    return data;
  },
  async criticalOccurrences(filters: ArmamentReportFilters = {}): Promise<ArmamentOccurrencesReportResponse> {
    const { data } = await api.get<ArmamentOccurrencesReportResponse>(`${basePath}/critical-occurrences`, { params: filters });
    return data;
  },
  async armamentPanel(armamentId: number | string): Promise<ArmamentPanelResponse> {
    const { data } = await api.get<ArmamentPanelResponse>(`${basePath}/armament-panel/${armamentId}`);
    return data;
  },
};
