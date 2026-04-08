import { api } from "@/lib/api";
import type {
  CollectionPatrimonyReportResponse,
  PaginatedPatrimonyReportResponse,
  PatrimonyAcquisitionCostItem,
  PatrimonyMovementReportItem,
  PatrimonyPanelResponse,
  PatrimonyReportFilters,
  PatrimonyReportSummary,
  PatrimonySectorDistributionItem,
  PatrimonyStatusOverviewItem,
  PatrimonyTypeDistributionItem,
} from "@/types/patrimony-report.type";

const basePath = "/patrimony-reports";

export const patrimonyReportsService = {
  async statusOverview(filters: PatrimonyReportFilters = {}): Promise<CollectionPatrimonyReportResponse<PatrimonyStatusOverviewItem>> {
    const { data } = await api.get<CollectionPatrimonyReportResponse<PatrimonyStatusOverviewItem>>(`${basePath}/status-overview`, { params: filters });
    return data;
  },
  async typeDistribution(filters: PatrimonyReportFilters = {}): Promise<CollectionPatrimonyReportResponse<PatrimonyTypeDistributionItem>> {
    const { data } = await api.get<CollectionPatrimonyReportResponse<PatrimonyTypeDistributionItem>>(`${basePath}/type-distribution`, { params: filters });
    return data;
  },
  async sectorDistribution(filters: PatrimonyReportFilters = {}): Promise<CollectionPatrimonyReportResponse<PatrimonySectorDistributionItem>> {
    const { data } = await api.get<CollectionPatrimonyReportResponse<PatrimonySectorDistributionItem>>(`${basePath}/sector-distribution`, { params: filters });
    return data;
  },
  async active(filters: PatrimonyReportFilters = {}): Promise<PaginatedPatrimonyReportResponse<PatrimonyReportSummary>> {
    const { data } = await api.get<PaginatedPatrimonyReportResponse<PatrimonyReportSummary>>(`${basePath}/active`, { params: filters });
    return data;
  },
  async writeOffs(filters: PatrimonyReportFilters = {}): Promise<PaginatedPatrimonyReportResponse<PatrimonyReportSummary>> {
    const { data } = await api.get<PaginatedPatrimonyReportResponse<PatrimonyReportSummary>>(`${basePath}/write-offs`, { params: filters });
    return data;
  },
  async movements(filters: PatrimonyReportFilters = {}): Promise<PaginatedPatrimonyReportResponse<PatrimonyMovementReportItem>> {
    const { data } = await api.get<PaginatedPatrimonyReportResponse<PatrimonyMovementReportItem>>(`${basePath}/movements`, { params: filters });
    return data;
  },
  async acquisitionCosts(filters: PatrimonyReportFilters = {}): Promise<CollectionPatrimonyReportResponse<PatrimonyAcquisitionCostItem>> {
    const { data } = await api.get<CollectionPatrimonyReportResponse<PatrimonyAcquisitionCostItem>>(`${basePath}/acquisition-costs`, { params: filters });
    return data;
  },
  async patrimonyPanel(patrimonyId: number | string): Promise<PatrimonyPanelResponse> {
    const { data } = await api.get<PatrimonyPanelResponse>(`${basePath}/patrimony-panel/${patrimonyId}`);
    return data;
  },
};
