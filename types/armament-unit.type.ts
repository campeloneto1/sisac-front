import type { PaginatedMeta } from "@/types/brand.type";
import type { ArmamentItem } from "@/types/armament.type";

export const armamentUnitStatusOptions = [
  { value: "available", label: "Disponível", color: "green" },
  { value: "loaned", label: "Emprestado", color: "blue" },
  { value: "assigned", label: "Cedido", color: "purple" },
  { value: "maintenance", label: "Em manutenção", color: "yellow" },
  { value: "discharged", label: "Baixado", color: "gray" },
  { value: "lost", label: "Extraviado", color: "red" },
] as const;

export type ArmamentUnitStatus = (typeof armamentUnitStatusOptions)[number]["value"];

export interface ArmamentUnitStatusInfo {
  value: ArmamentUnitStatus;
  label: string;
  color?: string | null;
}

export interface ArmamentUnitItem {
  id: number;
  armament_id: number;
  serial_number?: string | null;
  acquisition_date?: string | null;
  expiration_date?: string | null;
  status?: ArmamentUnitStatusInfo | null;
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

export interface ArmamentUnitFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: ArmamentUnitStatus | null;
  expiration?: "expired" | "expiring" | "regular" | null;
}

export interface CreateArmamentUnitDTO {
  serial_number?: string | null;
  acquisition_date?: string | null;
  expiration_date?: string | null;
  status: ArmamentUnitStatus;
}

export type UpdateArmamentUnitDTO = Partial<CreateArmamentUnitDTO>;

export interface ArmamentUnitResponse {
  message: string;
  data: ArmamentUnitItem;
}

export interface PaginatedArmamentUnitsResponse {
  message?: string;
  data: ArmamentUnitItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}

export function getArmamentUnitStatusLabel(value?: string | null) {
  return armamentUnitStatusOptions.find((option) => option.value === value)?.label ?? "Não informado";
}

export function getArmamentUnitBadgeVariant(
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
