import type { PaginatedMeta } from "@/types/brand.type";
import type { UserListItem } from "@/types/user.type";
import type { VehicleCustodyItem } from "@/types/vehicle-custody.type";
import type { VehicleLoanItem } from "@/types/vehicle-loan.type";
import type { VehicleMaintenanceItem } from "@/types/vehicle-maintenance.type";
import type { VehicleItem } from "@/types/vehicle.type";

export type VehicleFuelType = "gasoline" | "ethanol" | "diesel" | "gnv";

export type VehicleFuelingContextType =
  | "vehicle_loan"
  | "vehicle_custody"
  | "vehicle_maintenance";

export interface VehicleFuelingItem {
  id: number;
  vehicle_id: number;
  vehicle?: VehicleItem | null;
  fuelable_type?: string | null;
  fuelable_id?: number | null;
  fuelable?: VehicleLoanItem | VehicleCustodyItem | VehicleMaintenanceItem | null;
  vehicle_loan_id?: number | null;
  vehicle_custody_id?: number | null;
  vehicle_maintenance_id?: number | null;
  fueling_date: string;
  fueling_time?: string | null;
  km: number;
  fuel_type: VehicleFuelType;
  fuel_type_label?: string | null;
  liters: number;
  price_per_liter?: number | null;
  total_cost?: number | null;
  gas_station?: string | null;
  gas_station_city?: string | null;
  fueled_by_user_id?: number | null;
  fueled_by_user?: UserListItem | null;
  invoice_number?: string | null;
  is_full_tank: boolean;
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

export interface VehicleFuelingFilters {
  page?: number;
  per_page?: number;
  search?: string;
  vehicle_id?: number | null;
  vehicle_loan_id?: number | null;
  vehicle_custody_id?: number | null;
  vehicle_maintenance_id?: number | null;
  fuel_type?: VehicleFuelType;
  fueling_date_from?: string;
  fueling_date_to?: string;
  is_full_tank?: boolean | null;
}

export interface CreateVehicleFuelingDTO {
  vehicle_id: number;
  vehicle_loan_id?: number | null;
  vehicle_custody_id?: number | null;
  vehicle_maintenance_id?: number | null;
  fueling_date: string;
  fueling_time?: string | null;
  km: number;
  fuel_type: VehicleFuelType;
  liters: number;
  price_per_liter?: number | null;
  total_cost?: number | null;
  gas_station?: string | null;
  gas_station_city?: string | null;
  fueled_by_user_id?: number | null;
  invoice_number?: string | null;
  is_full_tank?: boolean;
  notes?: string | null;
}

export interface UpdateVehicleFuelingDTO
  extends Partial<CreateVehicleFuelingDTO> {}

export interface VehicleFuelingResponse {
  message: string;
  data: VehicleFuelingItem;
}

export interface PaginatedVehicleFuelingsResponse {
  data: VehicleFuelingItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}

export const vehicleFuelTypeOptions: Array<{
  value: VehicleFuelType;
  label: string;
}> = [
  { value: "gasoline", label: "Gasolina" },
  { value: "ethanol", label: "Etanol" },
  { value: "diesel", label: "Diesel" },
  { value: "gnv", label: "GNV" },
];

export const vehicleFuelingContextOptions: Array<{
  value: VehicleFuelingContextType;
  label: string;
}> = [
  { value: "vehicle_loan", label: "Emprestimo" },
  { value: "vehicle_custody", label: "Cautela" },
  { value: "vehicle_maintenance", label: "Manutencao" },
];

export function getVehicleFuelingContextType(
  fueling?: Pick<
    VehicleFuelingItem,
    "vehicle_loan_id" | "vehicle_custody_id" | "vehicle_maintenance_id"
  > | null,
): VehicleFuelingContextType | null {
  if (fueling?.vehicle_loan_id) {
    return "vehicle_loan";
  }

  if (fueling?.vehicle_custody_id) {
    return "vehicle_custody";
  }

  if (fueling?.vehicle_maintenance_id) {
    return "vehicle_maintenance";
  }

  return null;
}

export function getVehicleFuelingContextLabel(
  fueling?: Pick<
    VehicleFuelingItem,
    "vehicle_loan_id" | "vehicle_custody_id" | "vehicle_maintenance_id"
  > | null,
) {
  const contextType = getVehicleFuelingContextType(fueling);

  return (
    vehicleFuelingContextOptions.find((option) => option.value === contextType)
      ?.label ?? "Sem contexto"
  );
}

export function getVehicleFuelTypeVariant(fuelType?: VehicleFuelType | null) {
  switch (fuelType) {
    case "gasoline":
      return "danger";
    case "ethanol":
      return "success";
    case "diesel":
      return "warning";
    case "gnv":
      return "info";
    default:
      return "outline";
  }
}
