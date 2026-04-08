import { api } from "@/lib/api";
import type {
  CollectionServiceReportResponse,
  PaginatedServiceReportResponse,
  ServiceByTypeItem,
  ServiceCompletionItem,
  ServiceCostSummaryItem,
  ServicePanelResponse,
  ServicePriorityOverviewItem,
  ServiceReportFilters,
  ServiceReportSummary,
  ServiceStatusChangeItem,
  ServiceStatusOverviewItem,
} from "@/types/service-report.type";

const basePath = "/service-reports";

export const serviceReportsService = {
  async statusOverview(filters: ServiceReportFilters = {}): Promise<CollectionServiceReportResponse<ServiceStatusOverviewItem>> {
    const { data } = await api.get<CollectionServiceReportResponse<ServiceStatusOverviewItem>>(`${basePath}/status-overview`, { params: filters });
    return data;
  },
  async priorityOverview(filters: ServiceReportFilters = {}): Promise<CollectionServiceReportResponse<ServicePriorityOverviewItem>> {
    const { data } = await api.get<CollectionServiceReportResponse<ServicePriorityOverviewItem>>(`${basePath}/priority-overview`, { params: filters });
    return data;
  },
  async byType(filters: ServiceReportFilters = {}): Promise<CollectionServiceReportResponse<ServiceByTypeItem>> {
    const { data } = await api.get<CollectionServiceReportResponse<ServiceByTypeItem>>(`${basePath}/by-type`, { params: filters });
    return data;
  },
  async operationalBacklog(filters: ServiceReportFilters = {}): Promise<PaginatedServiceReportResponse<ServiceReportSummary>> {
    const { data } = await api.get<PaginatedServiceReportResponse<ServiceReportSummary>>(`${basePath}/operational-backlog`, { params: filters });
    return data;
  },
  async completed(filters: ServiceReportFilters = {}): Promise<PaginatedServiceReportResponse<ServiceCompletionItem>> {
    const { data } = await api.get<PaginatedServiceReportResponse<ServiceCompletionItem>>(`${basePath}/completed`, { params: filters });
    return data;
  },
  async costSummary(filters: ServiceReportFilters = {}): Promise<CollectionServiceReportResponse<ServiceCostSummaryItem>> {
    const { data } = await api.get<CollectionServiceReportResponse<ServiceCostSummaryItem>>(`${basePath}/cost-summary`, { params: filters });
    return data;
  },
  async statusChanges(filters: ServiceReportFilters = {}): Promise<PaginatedServiceReportResponse<ServiceStatusChangeItem>> {
    const { data } = await api.get<PaginatedServiceReportResponse<ServiceStatusChangeItem>>(`${basePath}/status-changes`, { params: filters });
    return data;
  },
  async servicePanel(serviceId: number | string): Promise<ServicePanelResponse> {
    const { data } = await api.get<ServicePanelResponse>(`${basePath}/service-panel/${serviceId}`);
    return data;
  },
};
