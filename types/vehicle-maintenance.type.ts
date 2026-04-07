import type { PaginatedMeta } from "@/types/brand.type";
import type { VehicleItem } from "@/types/vehicle.type";
import type { WorkshopItem } from "@/types/workshop.type";

export type VehicleMaintenanceType =
  | "preventive"
  | "corrective"
  | "inspection"
  | "other";

export type VehicleMaintenanceStatus =
  | "in_progress"
  | "completed"
  | "cancelled";

export interface VehicleMaintenanceReplacedPart {
  part: string;
  quantity: number;
  cost?: number | null;
}

export interface VehicleMaintenanceItem {
  id: number;
  vehicle_id: number;
  vehicle?: VehicleItem | null;
  workshop_id?: number | null;
  workshop?: WorkshopItem | null;
  maintenance_type?: VehicleMaintenanceType | null;
  maintenance_type_label?: string | null;
  description: string;
  entry_date: string;
  entry_time?: string | null;
  entry_km: number;
  exit_date?: string | null;
  exit_time?: string | null;
  exit_km?: number | null;
  expected_completion_date?: string | null;
  cost?: number | null;
  parts_cost?: number | null;
  labor_cost?: number | null;
  status?: VehicleMaintenanceStatus | null;
  status_label?: string | null;
  notes?: string | null;
  replaced_parts?: VehicleMaintenanceReplacedPart[] | null;
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

export interface VehicleMaintenanceFilters {
  page?: number;
  per_page?: number;
  search?: string;
  vehicle_id?: number | null;
  workshop_id?: number | null;
  maintenance_type?: VehicleMaintenanceType;
  status?: VehicleMaintenanceStatus;
}

export interface CreateVehicleMaintenanceDTO {
  vehicle_id: number;
  workshop_id?: number | null;
  maintenance_type: VehicleMaintenanceType;
  description: string;
  entry_date: string;
  entry_time?: string | null;
  entry_km: number;
  exit_date?: string | null;
  exit_time?: string | null;
  exit_km?: number | null;
  expected_completion_date?: string | null;
  cost?: number | null;
  parts_cost?: number | null;
  labor_cost?: number | null;
  status?: VehicleMaintenanceStatus;
  notes?: string | null;
  replaced_parts?: VehicleMaintenanceReplacedPart[] | null;
}

export interface UpdateVehicleMaintenanceDTO
  extends Partial<CreateVehicleMaintenanceDTO> {}

export interface VehicleMaintenanceResponse {
  message: string;
  data: VehicleMaintenanceItem;
}

export interface PaginatedVehicleMaintenancesResponse {
  data: VehicleMaintenanceItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}

export const vehicleMaintenanceTypeOptions: Array<{
  value: VehicleMaintenanceType;
  label: string;
}> = [
  { value: "preventive", label: "Preventiva" },
  { value: "corrective", label: "Corretiva" },
  { value: "inspection", label: "Inspecao" },
  { value: "other", label: "Outro" },
];

export const vehicleMaintenanceStatusOptions: Array<{
  value: VehicleMaintenanceStatus;
  label: string;
}> = [
  { value: "in_progress", label: "Em andamento" },
  { value: "completed", label: "Concluida" },
  { value: "cancelled", label: "Cancelada" },
];

export function getVehicleMaintenanceStatusVariant(
  status?: VehicleMaintenanceStatus | null,
) {
  switch (status) {
    case "in_progress":
      return "warning";
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "outline";
  }
}
