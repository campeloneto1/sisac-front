import { api } from "@/lib/api";
import type {
  PoliceOfficerAllocationHistoryReportResponse,
  CollectionPoliceOfficerReportResponse,
  PaginatedPoliceOfficerReportResponse,
  PoliceOfficerActiveInactiveItem,
  PoliceOfficerCoursesOverviewReportResponse,
  PoliceOfficerEffectiveBySectorItem,
  PoliceOfficerLeaveTypeDurationItem,
  PoliceOfficerPendingCertificatesReportResponse,
  PoliceOfficerPromotionEligibilityReportResponse,
  PoliceOfficerPromotionHistoryReportResponse,
  PoliceOfficerRankDistributionItem,
  PoliceOfficerReportFilters,
  PoliceOfficerRetirementRequestsReportResponse,
  PoliceOfficerLeavesReportResponse,
  PoliceOfficerVacationsOverviewReportResponse,
  PoliceOfficerVacationBalancesReportResponse,
  PoliceOfficerFunctionalPanelResponse,
} from "@/types/police-officer-report.type";

const basePath = "/police-officer-reports";

export const policeOfficerReportsService = {
  async activeInactive(
    filters: PoliceOfficerReportFilters = {},
  ): Promise<PaginatedPoliceOfficerReportResponse<PoliceOfficerActiveInactiveItem>> {
    const { data } = await api.get<PaginatedPoliceOfficerReportResponse<PoliceOfficerActiveInactiveItem>>(
      `${basePath}/active-inactive`,
      {
        params: filters,
      },
    );

    return data;
  },

  async effectiveBySector(
    filters: PoliceOfficerReportFilters = {},
  ): Promise<CollectionPoliceOfficerReportResponse<PoliceOfficerEffectiveBySectorItem>> {
    const { data } = await api.get<CollectionPoliceOfficerReportResponse<PoliceOfficerEffectiveBySectorItem>>(
      `${basePath}/effective-by-sector`,
      {
        params: filters,
      },
    );

    return data;
  },

  async rankDistribution(
    filters: PoliceOfficerReportFilters = {},
  ): Promise<CollectionPoliceOfficerReportResponse<PoliceOfficerRankDistributionItem>> {
    const { data } = await api.get<CollectionPoliceOfficerReportResponse<PoliceOfficerRankDistributionItem>>(
      `${basePath}/rank-distribution`,
      {
        params: filters,
      },
    );

    return data;
  },

  async leaves(
    filters: PoliceOfficerReportFilters = {},
  ): Promise<PoliceOfficerLeavesReportResponse> {
    const { data } = await api.get<PoliceOfficerLeavesReportResponse>(
      `${basePath}/leaves`,
      {
        params: filters,
      },
    );

    return data;
  },

  async leavesByTypeDuration(
    filters: PoliceOfficerReportFilters = {},
  ): Promise<CollectionPoliceOfficerReportResponse<PoliceOfficerLeaveTypeDurationItem>> {
    const { data } = await api.get<
      CollectionPoliceOfficerReportResponse<PoliceOfficerLeaveTypeDurationItem>
    >(`${basePath}/leaves-by-type-duration`, {
      params: filters,
    });

    return data;
  },

  async vacationsOverview(
    filters: PoliceOfficerReportFilters = {},
  ): Promise<PoliceOfficerVacationsOverviewReportResponse> {
    const { data } = await api.get<PoliceOfficerVacationsOverviewReportResponse>(
      `${basePath}/vacations-overview`,
      {
        params: filters,
      },
    );

    return data;
  },

  async vacationBalances(
    filters: PoliceOfficerReportFilters = {},
  ): Promise<PoliceOfficerVacationBalancesReportResponse> {
    const { data } = await api.get<PoliceOfficerVacationBalancesReportResponse>(
      `${basePath}/vacation-balances`,
      {
        params: filters,
      },
    );

    return data;
  },

  async allocationHistory(
    filters: PoliceOfficerReportFilters = {},
  ): Promise<PoliceOfficerAllocationHistoryReportResponse> {
    const { data } = await api.get<PoliceOfficerAllocationHistoryReportResponse>(
      `${basePath}/allocation-history`,
      { params: filters },
    );

    return data;
  },

  async promotionEligibility(
    filters: PoliceOfficerReportFilters = {},
  ): Promise<PoliceOfficerPromotionEligibilityReportResponse> {
    const { data } = await api.get<PoliceOfficerPromotionEligibilityReportResponse>(
      `${basePath}/promotion-eligibility`,
      { params: filters },
    );

    return data;
  },

  async promotionHistory(
    filters: PoliceOfficerReportFilters = {},
  ): Promise<PoliceOfficerPromotionHistoryReportResponse> {
    const { data } = await api.get<PoliceOfficerPromotionHistoryReportResponse>(
      `${basePath}/promotion-history`,
      { params: filters },
    );

    return data;
  },

  async pendingCopem(
    filters: PoliceOfficerReportFilters = {},
  ): Promise<PoliceOfficerLeavesReportResponse> {
    const { data } = await api.get<PoliceOfficerLeavesReportResponse>(
      `${basePath}/pending-copem`,
      { params: filters },
    );

    return data;
  },

  async coursesOverview(
    filters: PoliceOfficerReportFilters = {},
  ): Promise<PoliceOfficerCoursesOverviewReportResponse> {
    const { data } = await api.get<PoliceOfficerCoursesOverviewReportResponse>(
      `${basePath}/courses-overview`,
      { params: filters },
    );

    return data;
  },

  async pendingCertificates(
    filters: PoliceOfficerReportFilters = {},
  ): Promise<PoliceOfficerPendingCertificatesReportResponse> {
    const { data } = await api.get<PoliceOfficerPendingCertificatesReportResponse>(
      `${basePath}/pending-certificates`,
      { params: filters },
    );

    return data;
  },

  async retirementRequests(
    filters: PoliceOfficerReportFilters = {},
  ): Promise<PoliceOfficerRetirementRequestsReportResponse> {
    const { data } = await api.get<PoliceOfficerRetirementRequestsReportResponse>(
      `${basePath}/retirement-requests`,
      { params: filters },
    );

    return data;
  },

  async functionalPanel(
    policeOfficerId: number | string,
  ): Promise<PoliceOfficerFunctionalPanelResponse> {
    const { data } = await api.get<PoliceOfficerFunctionalPanelResponse>(
      `${basePath}/functional-panel/${policeOfficerId}`,
    );

    return data;
  },
};
