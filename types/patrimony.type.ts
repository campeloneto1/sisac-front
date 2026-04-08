import type { ApiMessageResponse } from "@/types/auth.type";
import type { PaginatedMeta } from "@/types/brand.type";
import type { PatrimonyTypeItem } from "@/types/patrimony-type.type";
import type { SectorItem } from "@/types/sector.type";

export type PatrimonyStatusValue = "active" | "returned" | "disposed";

export interface PatrimonyStatusInfo {
  value: PatrimonyStatusValue;
  label: string;
  color: string;
}

export const patrimonyDisposeStatusOptions: Array<{
  value: Exclude<PatrimonyStatusValue, "active">;
  label: string;
}> = [
  { value: "returned", label: "Devolvido ao Estado" },
  { value: "disposed", label: "Inutilizado" },
];

export interface PatrimonyItem {
  id: number;
  code: string;
  patrimony_type?: Pick<PatrimonyTypeItem, "id" | "name"> | null;
  current_sector?: Pick<SectorItem, "id" | "name" | "abbreviation"> | null;
  serial_number?: string | null;
  description?: string | null;
  status: PatrimonyStatusInfo;
  acquisition_date?: string | null;
  acquisition_value?: number | null;
  supplier?: string | null;
  invoice_number?: string | null;
  disposed_at?: string | null;
  disposed_reason?: string | null;
  disposed_protocol?: string | null;
  disposed_notes?: string | null;
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

export interface PatrimonySectorHistoryItem {
  id: number;
  patrimony_id: number;
  from_sector?: Pick<SectorItem, "id" | "name" | "abbreviation"> | null;
  to_sector?: Pick<SectorItem, "id" | "name" | "abbreviation"> | null;
  transferred_at?: string | null;
  reason?: string | null;
  transferred_by?: {
    id: number;
    name: string;
    email: string;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PatrimonyFilters {
  page?: number;
  per_page?: number;
  search?: string;
  patrimony_type_id?: number | null;
  current_sector_id?: number | null;
  status?: PatrimonyStatusValue | null;
}

export interface CreatePatrimonyDTO {
  patrimony_type_id: number;
  current_sector_id?: number | null;
  serial_number?: string | null;
  description?: string | null;
  acquisition_date?: string | null;
  acquisition_value?: number | null;
  supplier?: string | null;
  invoice_number?: string | null;
}

export interface UpdatePatrimonyDTO {
  patrimony_type_id?: number;
  serial_number?: string | null;
  description?: string | null;
  acquisition_date?: string | null;
  acquisition_value?: number | null;
  supplier?: string | null;
  invoice_number?: string | null;
}

export interface TransferPatrimonyDTO {
  to_sector_id: number;
  reason?: string | null;
}

export interface DisposePatrimonyDTO {
  status: Exclude<PatrimonyStatusValue, "active">;
  disposed_reason: string;
  disposed_protocol?: string | null;
  disposed_notes?: string | null;
}

export interface PatrimonyResponse {
  message: string;
  data: PatrimonyItem;
}

export interface PatrimonyHistoryResponse {
  message: string;
  data: PatrimonySectorHistoryItem[];
}

export interface PaginatedPatrimoniesResponse {
  data: PatrimonyItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}

export type PatrimonyDeleteResponse = ApiMessageResponse;

export function getPatrimonyStatusVariant(status?: string | null) {
  switch (status) {
    case "active":
      return "success" as const;
    case "returned":
      return "info" as const;
    case "disposed":
      return "danger" as const;
    default:
      return "outline" as const;
  }
}
