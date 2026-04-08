import type { PaginatedMeta } from "@/types/brand.type";
import type { ArmamentItem } from "@/types/armament.type";
import type { PoliceOfficerItem } from "@/types/police-officer.type";
import type { UserListItem } from "@/types/user.type";

export type ArmamentLoanKind = "temporary" | "cautela";
export type ArmamentLoanStatus = "open" | "partial" | "returned" | "overdue";

export interface ArmamentLoanUnitSummary {
  id: number;
  serial_number?: string | null;
  status?: string | null;
  status_label?: string | null;
}

export interface ArmamentLoanBatchSummary {
  id: number;
  batch_number?: string | null;
  quantity?: number | null;
  available_quantity?: number | null;
  used_quantity?: number | null;
  expiration_date?: string | null;
}

export interface ArmamentLoanItem {
  id: number;
  armament_loan_id: number;
  armament_id: number;
  armament_unit_id?: number | null;
  armament_batch_id?: number | null;
  quantity: number;
  returned_quantity: number;
  consumed_quantity: number;
  lost_quantity: number;
  pending_quantity: number;
  return_percentage?: number | null;
  is_fully_returned?: boolean;
  is_partially_returned?: boolean;
  armament?: ArmamentItem | null;
  unit?: ArmamentLoanUnitSummary | null;
  batch?: ArmamentLoanBatchSummary | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ArmamentLoanRecord {
  id: number;
  police_officer_id: number;
  kind: ArmamentLoanKind;
  kind_label?: string | null;
  loaned_at: string;
  expected_return_at?: string | null;
  returned_at?: string | null;
  status: ArmamentLoanStatus;
  status_label?: string | null;
  status_color?: string | null;
  purpose?: string | null;
  return_notes?: string | null;
  approved_by?: number | null;
  total_quantity: number;
  returned_quantity: number;
  consumed_quantity: number;
  lost_quantity: number;
  pending_quantity: number;
  return_percentage?: number | null;
  has_divergent_return?: boolean;
  police_officer?: PoliceOfficerItem | null;
  approved_by_user?: Pick<UserListItem, "id" | "name" | "email"> | null;
  items?: ArmamentLoanItem[];
  creator?: Pick<UserListItem, "id" | "name" | "email"> | null;
  updater?: Pick<UserListItem, "id" | "name" | "email"> | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ArmamentLoanFilters {
  page?: number;
  per_page?: number;
  search?: string;
  police_officer_id?: number | null;
  status?: ArmamentLoanStatus | null;
  kind?: ArmamentLoanKind | null;
  armament_id?: number | null;
  loaned_from?: string;
  loaned_to?: string;
}

export interface CreateArmamentLoanItemDTO {
  armament_id: number;
  armament_unit_id?: number | null;
  armament_batch_id?: number | null;
  quantity: number;
}

export interface CreateArmamentLoanDTO {
  police_officer_id: number;
  kind?: ArmamentLoanKind;
  loaned_at: string;
  expected_return_at?: string | null;
  purpose?: string | null;
  approved_by?: number | null;
  items: CreateArmamentLoanItemDTO[];
}

export interface UpdateArmamentLoanDTO {
  kind?: ArmamentLoanKind;
  expected_return_at?: string | null;
  purpose?: string | null;
  return_notes?: string | null;
  approved_by?: number | null;
}

export interface ReturnArmamentLoanItemDTO {
  id: number;
  returned_quantity?: number | null;
  consumed_quantity?: number | null;
  lost_quantity?: number | null;
  consumed_justification?: string | null;
  lost_justification?: string | null;
  lost_report_number?: string | null;
}

export interface MarkArmamentLoanReturnedDTO {
  returned_at: string;
  return_notes?: string | null;
  approved_by?: number | null;
  items: ReturnArmamentLoanItemDTO[];
}

export interface ArmamentLoanResponse {
  message: string;
  data: ArmamentLoanRecord;
}

export interface PaginatedArmamentLoansResponse {
  data: ArmamentLoanRecord[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}

export const armamentLoanKindOptions: Array<{
  value: ArmamentLoanKind;
  label: string;
}> = [
  { value: "temporary", label: "Temporário" },
  { value: "cautela", label: "Cautela" },
];

export const armamentLoanStatusOptions: Array<{
  value: ArmamentLoanStatus;
  label: string;
}> = [
  { value: "open", label: "Em aberto" },
  { value: "partial", label: "Parcial" },
  { value: "returned", label: "Devolvido" },
  { value: "overdue", label: "Em atraso" },
];

export function getArmamentLoanStatusVariant(status?: string | null) {
  if (status === "returned") {
    return "success" as const;
  }

  if (status === "partial") {
    return "warning" as const;
  }

  if (status === "overdue") {
    return "danger" as const;
  }

  return "info" as const;
}

export function getArmamentLoanKindVariant(kind?: string | null) {
  if (kind === "cautela") {
    return "secondary" as const;
  }

  return "outline" as const;
}

export function getArmamentLoanItemModeLabel(item: Pick<ArmamentLoanItem, "armament_unit_id" | "armament_batch_id">) {
  return item.armament_unit_id ? "Unidade" : "Lote";
}
