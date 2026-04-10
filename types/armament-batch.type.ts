import type { PaginatedMeta } from "@/types/brand.type";
import type { ArmamentItem } from "@/types/armament.type";

export interface ArmamentBatchItem {
  id: number;
  armament_id: number;
  batch_number: string;
  quantity: number;
  expiration_date?: string | null;
  available_quantity: number;
  used_quantity: number;
  permanently_out_quantity: number;
  available_percentage: number;
  usage_percentage: number;
  is_expired: boolean;
  is_expiring_soon: boolean;
  armament?: ArmamentItem | null;
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
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface ArmamentBatchFilters {
  page?: number;
  per_page?: number;
  search?: string;
  armament_id?: number | string;
  batch_number?: string;
  only_available?: boolean;
  only_expired?: boolean;
  expiring_in_days?: number;
}

export interface CreateArmamentBatchDTO {
  armament_id: number;
  batch_number: string;
  quantity: number;
  expiration_date?: string | null;
}

export type UpdateArmamentBatchDTO = Partial<Omit<CreateArmamentBatchDTO, "armament_id">>;

export interface ArmamentBatchResponse {
  message: string;
  data: ArmamentBatchItem;
}

export interface PaginatedArmamentBatchesResponse {
  message?: string;
  data: ArmamentBatchItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}

export function getExpirationBadgeVariant(
  batch: ArmamentBatchItem,
): "danger" | "warning" | "success" {
  if (batch.is_expired) {
    return "danger";
  }
  if (batch.is_expiring_soon) {
    return "warning";
  }
  return "success";
}

export function getExpirationLabel(batch: ArmamentBatchItem): string {
  if (batch.is_expired) {
    return "Vencido";
  }
  if (batch.is_expiring_soon) {
    return "A vencer";
  }
  return "Regular";
}

export function getAvailabilityBadgeVariant(
  percentage: number,
): "danger" | "warning" | "success" {
  if (percentage <= 10) {
    return "danger";
  }
  if (percentage <= 30) {
    return "warning";
  }
  return "success";
}
