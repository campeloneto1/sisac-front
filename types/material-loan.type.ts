import type { PaginatedMeta } from "@/types/brand.type";
import type { MaterialBatchItem, MaterialItem, MaterialUnitItem } from "@/types/material.type";
import type { PoliceOfficerItem } from "@/types/police-officer.type";
import type { UserListItem } from "@/types/user.type";

export type MaterialLoanKind = "temporary" | "cautela";
export type MaterialLoanStatus = "open" | "partial" | "returned" | "overdue";

export type MaterialLoanUnitSummary = Pick<
  MaterialUnitItem,
  | "id"
  | "patrimony_number_1"
  | "patrimony_number_2"
  | "status"
  | "status_label"
  | "expiration_date"
>;

export type MaterialLoanBatchSummary = Pick<
  MaterialBatchItem,
  | "id"
  | "batch_number"
  | "quantity"
  | "available_quantity"
  | "used_quantity"
  | "expiration_date"
>;

export interface MaterialLoanItem {
  id: number;
  material_loan_id: number;
  material_id: number;
  material_unit_id?: number | null;
  material_batch_id?: number | null;
  quantity: number;
  returned_quantity: number;
  consumed_quantity: number;
  lost_quantity: number;
  pending_quantity: number;
  is_fully_returned?: boolean;
  material?: MaterialItem | null;
  unit?: MaterialLoanUnitSummary | null;
  batch?: MaterialLoanBatchSummary | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface MaterialLoanRecord {
  id: number;
  police_officer_id: number;
  kind: MaterialLoanKind;
  kind_label?: string | null;
  loaned_at: string;
  expected_return_at?: string | null;
  returned_at?: string | null;
  status: MaterialLoanStatus;
  status_label?: string | null;
  status_color?: string | null;
  purpose?: string | null;
  return_notes?: string | null;
  total_quantity: number;
  returned_quantity: number;
  pending_quantity: number;
  is_overdue?: boolean;
  police_officer?: PoliceOfficerItem | null;
  approved_by?: Pick<UserListItem, "id" | "name" | "email"> | null;
  items?: MaterialLoanItem[];
  creator?: Pick<UserListItem, "id" | "name" | "email"> | null;
  updater?: Pick<UserListItem, "id" | "name" | "email"> | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface MaterialLoanFilters {
  page?: number;
  per_page?: number;
  police_officer_id?: number | null;
  status?: MaterialLoanStatus | null;
  kind?: MaterialLoanKind | null;
  subunit_id?: number | null;
  active?: boolean | null;
}

export interface CreateMaterialLoanItemDTO {
  material_id: number;
  material_unit_id?: number | null;
  material_batch_id?: number | null;
  quantity: number;
}

export interface CreateMaterialLoanDTO {
  police_officer_id: number;
  kind?: MaterialLoanKind;
  loaned_at?: string | null;
  expected_return_at?: string | null;
  purpose?: string | null;
  approved_by?: number | null;
  items: CreateMaterialLoanItemDTO[];
}

export interface UpdateMaterialLoanDTO {
  expected_return_at?: string | null;
  purpose?: string | null;
  return_notes?: string | null;
  approved_by?: number | null;
}

export interface ReturnMaterialLoanItemDTO {
  id: number;
  returned_quantity: number;
  consumed_quantity?: number | null;
  lost_quantity?: number | null;
  consumed_justification?: string | null;
  lost_justification?: string | null;
  lost_report_number?: string | null;
}

export interface MarkMaterialLoanReturnedDTO {
  returned_at?: string | null;
  return_notes?: string | null;
  approved_by?: number | null;
  items: ReturnMaterialLoanItemDTO[];
}

export interface MaterialLoanResponse {
  message: string;
  data: MaterialLoanRecord;
}

export interface PaginatedMaterialLoansResponse {
  data: MaterialLoanRecord[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}

export const materialLoanKindOptions: Array<{
  value: MaterialLoanKind;
  label: string;
}> = [
  { value: "temporary", label: "Temporario" },
  { value: "cautela", label: "Cautela" },
];

export const materialLoanStatusOptions: Array<{
  value: MaterialLoanStatus;
  label: string;
}> = [
  { value: "open", label: "Em aberto" },
  { value: "partial", label: "Parcial" },
  { value: "returned", label: "Devolvido" },
  { value: "overdue", label: "Em atraso" },
];

export function getMaterialLoanStatusVariant(status?: string | null) {
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

export function getMaterialLoanKindVariant(kind?: string | null) {
  if (kind === "cautela") {
    return "secondary" as const;
  }

  return "outline" as const;
}

export function getMaterialLoanItemModeLabel(
  item: Pick<MaterialLoanItem, "material_unit_id" | "material_batch_id">,
) {
  return item.material_unit_id ? "Unidade" : "Lote";
}
