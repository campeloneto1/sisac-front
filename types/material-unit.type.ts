import type { PaginatedMeta } from "@/types/brand.type";
import type { MaterialItem } from "@/types/material.type";

export const materialUnitStatusOptions = [
  { value: "available", label: "Disponível", color: "green" },
  { value: "loaned", label: "Emprestado", color: "blue" },
  { value: "assigned", label: "Cedido", color: "purple" },
  { value: "maintenance", label: "Em manutenção", color: "yellow" },
  { value: "discharged", label: "Baixado", color: "gray" },
  { value: "lost", label: "Extraviado", color: "red" },
] as const;

export type MaterialUnitStatus = (typeof materialUnitStatusOptions)[number]["value"];

export interface MaterialUnitStatusInfo {
  value: MaterialUnitStatus;
  label: string;
  color?: string | null;
}

export interface MaterialUnitItem {
  id: number;
  material_id: number;
  patrimony_number_1?: string | null;
  patrimony_number_2?: string | null;
  acquisition_date?: string | null;
  expiration_date?: string | null;
  status?: MaterialUnitStatusInfo | null;
  is_expired: boolean;
  is_expiring_soon: boolean;
  material?: MaterialItem | null;
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

export interface MaterialUnitFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: MaterialUnitStatus | null;
  expiration?: "expired" | "expiring" | "regular" | null;
}

export interface CreateMaterialUnitDTO {
  patrimony_number_1?: string | null;
  patrimony_number_2?: string | null;
  acquisition_date?: string | null;
  expiration_date?: string | null;
  status: MaterialUnitStatus;
}

export type UpdateMaterialUnitDTO = Partial<CreateMaterialUnitDTO>;

export interface MaterialUnitResponse {
  message: string;
  data: MaterialUnitItem;
}

export interface PaginatedMaterialUnitsResponse {
  message?: string;
  data: MaterialUnitItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}

export function getMaterialUnitStatusLabel(value?: string | null) {
  return materialUnitStatusOptions.find((option) => option.value === value)?.label ?? "Não informado";
}

export function getMaterialUnitBadgeVariant(
  color?: string | null,
): "danger" | "warning" | "info" | "success" | "outline" {
  switch (color) {
    case "red":
      return "danger";
    case "yellow":
      return "warning";
    case "blue":
    case "purple":
      return "info";
    case "green":
      return "success";
    default:
      return "outline";
  }
}
