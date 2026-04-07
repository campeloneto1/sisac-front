import type { PaginatedMeta } from "@/types/brand.type";
import type { CompanyItem } from "@/types/company.type";
import type { VehicleItem } from "@/types/vehicle.type";

export type VehicleRentalStatus =
  | "active"
  | "returned"
  | "renewed"
  | "cancelled";

export interface VehicleRentalItem {
  id: number;
  vehicle_id: number;
  vehicle?: VehicleItem | null;
  company_id: number;
  company?: CompanyItem | null;
  contract_number?: string | null;
  contract_start_date: string;
  contract_end_date?: string | null;
  actual_start_date?: string | null;
  actual_end_date?: string | null;
  daily_cost?: number | null;
  monthly_cost?: number | null;
  entry_km?: number | null;
  exit_km?: number | null;
  status?: VehicleRentalStatus | null;
  status_label?: string | null;
  status_color?: string | null;
  returned_to_company_date?: string | null;
  returned_from_company_date?: string | null;
  notes?: string | null;
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

export interface VehicleRentalFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: VehicleRentalStatus;
  vehicle_id?: number | null;
  company_id?: number | null;
}

export interface CreateVehicleRentalDTO {
  vehicle_id: number;
  company_id: number;
  contract_number?: string | null;
  contract_start_date: string;
  contract_end_date?: string | null;
  actual_start_date?: string | null;
  actual_end_date?: string | null;
  daily_cost?: number | null;
  monthly_cost?: number | null;
  entry_km?: number | null;
  exit_km?: number | null;
  status?: VehicleRentalStatus | null;
  returned_to_company_date?: string | null;
  returned_from_company_date?: string | null;
  notes?: string | null;
}

export interface UpdateVehicleRentalDTO
  extends Partial<CreateVehicleRentalDTO> {}

export interface VehicleRentalResponse {
  message: string;
  data: VehicleRentalItem;
}

export interface PaginatedVehicleRentalsResponse {
  data: VehicleRentalItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}

export const vehicleRentalStatusOptions: Array<{
  value: VehicleRentalStatus;
  label: string;
}> = [
  { value: "active", label: "Ativo" },
  { value: "returned", label: "Devolvido" },
  { value: "renewed", label: "Renovado" },
  { value: "cancelled", label: "Cancelado" },
];

export function getVehicleRentalStatusVariant(
  status?: VehicleRentalStatus | null,
) {
  switch (status) {
    case "active":
      return "success";
    case "returned":
      return "info";
    case "renewed":
      return "warning";
    case "cancelled":
      return "danger";
    default:
      return "outline";
  }
}
