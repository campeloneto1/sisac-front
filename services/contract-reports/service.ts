import { api } from "@/lib/api";
import type {
  CollectionContractReportResponse,
  ContractAlertReportItem,
  ContractExecutionOverviewItem,
  ContractExpiringItem,
  ContractPanelResponse,
  ContractReportFilters,
  ContractReportSummary,
  ContractStatusChangeReportItem,
  ContractStatusOverviewItem,
  ContractTransactionReportItem,
  PaginatedContractReportResponse,
} from "@/types/contract-report.type";

const basePath = "/contract-reports";

export const contractReportsService = {
  async statusOverview(filters: ContractReportFilters = {}): Promise<CollectionContractReportResponse<ContractStatusOverviewItem>> {
    const { data } = await api.get<CollectionContractReportResponse<ContractStatusOverviewItem>>(`${basePath}/status-overview`, { params: filters });
    return data;
  },
  async executionOverview(filters: ContractReportFilters = {}): Promise<CollectionContractReportResponse<ContractExecutionOverviewItem>> {
    const { data } = await api.get<CollectionContractReportResponse<ContractExecutionOverviewItem>>(`${basePath}/execution-overview`, { params: filters });
    return data;
  },
  async active(filters: ContractReportFilters = {}): Promise<PaginatedContractReportResponse<ContractReportSummary>> {
    const { data } = await api.get<PaginatedContractReportResponse<ContractReportSummary>>(`${basePath}/active`, { params: filters });
    return data;
  },
  async expiring(filters: ContractReportFilters = {}): Promise<PaginatedContractReportResponse<ContractExpiringItem>> {
    const { data } = await api.get<PaginatedContractReportResponse<ContractExpiringItem>>(`${basePath}/expiring`, { params: filters });
    return data;
  },
  async transactions(filters: ContractReportFilters = {}): Promise<PaginatedContractReportResponse<ContractTransactionReportItem>> {
    const { data } = await api.get<PaginatedContractReportResponse<ContractTransactionReportItem>>(`${basePath}/transactions`, { params: filters });
    return data;
  },
  async alerts(filters: ContractReportFilters = {}): Promise<PaginatedContractReportResponse<ContractAlertReportItem>> {
    const { data } = await api.get<PaginatedContractReportResponse<ContractAlertReportItem>>(`${basePath}/alerts`, { params: filters });
    return data;
  },
  async statusChanges(filters: ContractReportFilters = {}): Promise<PaginatedContractReportResponse<ContractStatusChangeReportItem>> {
    const { data } = await api.get<PaginatedContractReportResponse<ContractStatusChangeReportItem>>(`${basePath}/status-changes`, { params: filters });
    return data;
  },
  async contractPanel(contractId: number | string): Promise<ContractPanelResponse> {
    const { data } = await api.get<ContractPanelResponse>(`${basePath}/contract-panel/${contractId}`);
    return data;
  },
};
