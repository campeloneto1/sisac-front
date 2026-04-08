import type { PaginatedMeta } from "@/types/brand.type";
import type { MaterialTypeItem } from "@/types/material-type.type";
import type { SubunitItem } from "@/types/subunit.type";
import type { VariantItem } from "@/types/variant.type";

export const materialUnitStatusOptions = [
  { value: "available", label: "Disponível", color: "green" },
  { value: "loaned", label: "Emprestado", color: "blue" },
  { value: "assigned", label: "Cedido", color: "purple" },
  { value: "maintenance", label: "Em manutenção", color: "yellow" },
  { value: "discharged", label: "Baixado", color: "gray" },
  { value: "lost", label: "Extraviado", color: "red" },
] as const;

export type MaterialUnitStatus = (typeof materialUnitStatusOptions)[number]["value"];
export type MaterialSpecifications = Record<string, string>;

export interface MaterialUnitItem {
  id: number;
  material_id: number;
  patrimony_number_1?: string | null;
  patrimony_number_2?: string | null;
  acquisition_date?: string | null;
  expiration_date?: string | null;
  status?: MaterialUnitStatus | null;
  status_label?: string | null;
  status_color?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface MaterialBatchItem {
  id: number;
  material_id: number;
  batch_number: string;
  quantity: number;
  available_quantity?: number | null;
  used_quantity?: number | null;
  expiration_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface MaterialItem {
  id: number;
  subunit_id?: number | null;
  material_type_id: number;
  variant_id: number;
  specifications?: MaterialSpecifications | null;
  type?: Pick<MaterialTypeItem, "id" | "name" | "slug"> | null;
  variant?: VariantItem | null;
  subunit?: Pick<SubunitItem, "id" | "name" | "abbreviation"> | null;
  units?: MaterialUnitItem[];
  batches?: MaterialBatchItem[];
  units_count?: number | null;
  batches_count?: number | null;
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
}

export interface MaterialFilters {
  page?: number;
  per_page?: number;
  search?: string;
  material_type_id?: number | null;
  variant_id?: number | null;
  subunit_id?: number | null;
}

export interface CreateMaterialUnitDTO {
  patrimony_number_1?: string | null;
  patrimony_number_2?: string | null;
  acquisition_date?: string | null;
  expiration_date?: string | null;
  status?: MaterialUnitStatus | null;
}

export interface CreateMaterialBatchDTO {
  batch_number: string;
  quantity: number;
  expiration_date?: string | null;
}

export interface CreateMaterialDTO {
  material_type_id: number;
  variant_id: number;
  specifications?: MaterialSpecifications | null;
  units?: CreateMaterialUnitDTO[];
  batches?: CreateMaterialBatchDTO[];
}

export interface UpdateMaterialDTO {
  material_type_id?: number;
  variant_id?: number;
  specifications?: MaterialSpecifications | null;
}

export interface MaterialResponse {
  message: string;
  data: MaterialItem;
}

export interface PaginatedMaterialsResponse {
  data: MaterialItem[];
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

export function getMaterialUnitBadgeVariant(color?: string | null): "danger" | "warning" | "info" | "success" | "outline" {
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
