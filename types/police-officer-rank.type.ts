import type { PaginatedMeta } from "@/types/brand.type";
import type { RankItem } from "./rank.type";
import type { PoliceOfficerOption } from "./police-officer.type";

export type PromotionType = "merit" | "seniority" | "bravery";

export const promotionTypeLabels: Record<PromotionType, string> = {
  merit: "Merecimento",
  seniority: "Antiguidade",
  bravery: "Bravura",
};

export const promotionTypeDescriptions: Record<PromotionType, string> = {
  merit: "Promoção por desempenho e mérito profissional",
  seniority: "Promoção por tempo de serviço e antiguidade",
  bravery: "Promoção por ato de bravura ou heroísmo",
};

export interface PoliceOfficerRankItem {
  id: number;
  police_officer_id: number;
  rank_id: number;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  promotion_type?: PromotionType | null;
  promotion_bulletin?: string | null;
  promotion_date?: string | null;
  notes?: string | null;
  created_by: number;
  updated_by?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  police_officer?: PoliceOfficerOption | null;
  rank?: RankItem | null;
  creator?: {
    id: number;
    name: string;
    email: string;
  } | null;
  updater?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface CreatePoliceOfficerRankDTO {
  police_officer_id: number;
  rank_id: number;
  start_date: string;
  end_date?: string | null;
  promotion_type?: PromotionType | null;
  promotion_bulletin?: string | null;
  promotion_date?: string | null;
  notes?: string | null;
}

export interface UpdatePoliceOfficerRankDTO {
  police_officer_id?: number;
  rank_id?: number;
  start_date?: string;
  end_date?: string | null;
  promotion_type?: PromotionType | null;
  promotion_bulletin?: string | null;
  promotion_date?: string | null;
  notes?: string | null;
}

export interface PoliceOfficerRankFilters {
  page?: number;
  per_page?: number;
  police_officer_id?: number;
  rank_id?: number;
  current_only?: boolean;
}

export interface PoliceOfficerRankResponse {
  message: string;
  data: PoliceOfficerRankItem;
}

export interface BulkPromotePoliceOfficerRankDTO {
  police_officer_ids: number[];
  rank_id: number;
  start_date: string;
  promotion_type?: PromotionType | null;
  promotion_bulletin?: string | null;
  promotion_date?: string | null;
  notes?: string | null;
}

export interface BulkPromotePoliceOfficerRankFailure {
  id: number;
  name?: string;
  error: string;
}

export interface BulkPromotePoliceOfficerRankResponse {
  message: string;
  data: {
    promoted: number;
    failed_count: number;
    failed_details: BulkPromotePoliceOfficerRankFailure[];
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}
