import { api } from "@/lib/api";
import type {
  CollectionPoliceOfficerReportResponse,
  PaginatedPoliceOfficerReportResponse,
  PoliceOfficerActiveInactiveItem,
  PoliceOfficerEffectiveBySectorItem,
  PoliceOfficerRankDistributionItem,
  PoliceOfficerReportFilters,
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
};
