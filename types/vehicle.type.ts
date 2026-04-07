import type { PaginatedMeta } from "@/types/brand.type";
import type { ColorItem } from "@/types/color.type";
import type { SubunitItem } from "@/types/subunit.type";
import type { UserListItem } from "@/types/user.type";
import type { VariantItem } from "@/types/variant.type";
import type { VehicleTypeItem } from "@/types/vehicle-type.type";

export type VehicleOperationalStatus =
  | "available"
  | "in_use"
  | "maintenance"
  | "custody"
  | "decommissioned";

export type VehicleOwnershipType = "owned" | "rented";

export interface VehicleItem {
  id: number;
  license_plate: string;
  special_plate?: string | null;
  chassis?: string | null;
  renavam?: string | null;
  manufacture_year?: number | null;
  model_year?: number | null;
  is_armored: boolean;
  is_organic: boolean;
  is_available_for_trip: boolean;
  operational_status?: VehicleOperationalStatus | null;
  operational_status_label?: string | null;
  ownership_type?: VehicleOwnershipType | null;
  ownership_type_label?: string | null;
  is_assigned: boolean;
  is_available: boolean;
  initial_km: number;
  current_km: number;
  oil_change_km?: number | null;
  revision_km?: number | null;
  revision_date?: string | null;
  decommission_date?: string | null;
  notes?: string | null;
  color_id?: number | null;
  vehicle_type_id?: number | null;
  variant_id?: number | null;
  subunit_id?: number | null;
  assigned_to_user_id?: number | null;
  color?: Pick<ColorItem, "id" | "name" | "hex"> | null;
  vehicle_type?: Pick<VehicleTypeItem, "id" | "name" | "code"> | null;
  variant?: (Pick<VariantItem, "id" | "name" | "abbreviation"> & {
    brand?: VariantItem["brand"];
  }) | null;
  subunit?: Pick<SubunitItem, "id" | "name" | "abbreviation"> | null;
  assigned_to?: Pick<UserListItem, "id" | "name" | "email"> | null;
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

export interface VehicleFilters {
  page?: number;
  per_page?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
  subunit_id?: number | null;
  color_id?: number | null;
  vehicle_type_id?: number | null;
  variant_id?: number | null;
  assigned_to_user_id?: number | null;
  is_available?: boolean | null;
  is_active?: boolean | null;
}

export interface CreateVehicleDTO {
  license_plate: string;
  special_plate?: string | null;
  chassis?: string | null;
  renavam?: string | null;
  manufacture_year?: number | null;
  model_year?: number | null;
  is_armored?: boolean;
  is_organic?: boolean;
  is_available_for_trip?: boolean;
  operational_status?: VehicleOperationalStatus | null;
  ownership_type?: VehicleOwnershipType | null;
  assigned_to_user_id?: number | null;
  initial_km: number;
  current_km: number;
  oil_change_km?: number | null;
  revision_km?: number | null;
  revision_date?: string | null;
  decommission_date?: string | null;
  notes?: string | null;
  color_id?: number | null;
  vehicle_type_id?: number | null;
  variant_id?: number | null;
  subunit_id?: number | null;
}

export interface UpdateVehicleDTO extends Partial<CreateVehicleDTO> {}

export interface VehicleResponse {
  message: string;
  data: VehicleItem;
}

export interface PaginatedVehiclesResponse {
  data: VehicleItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}

export const vehicleOperationalStatusOptions: Array<{
  value: VehicleOperationalStatus;
  label: string;
}> = [
  { value: "available", label: "Disponivel" },
  { value: "in_use", label: "Em uso" },
  { value: "maintenance", label: "Em manutencao" },
  { value: "custody", label: "Cautelado" },
  { value: "decommissioned", label: "Baixado" },
];

export const vehicleOwnershipTypeOptions: Array<{
  value: VehicleOwnershipType;
  label: string;
}> = [
  { value: "owned", label: "Proprio" },
  { value: "rented", label: "Locado" },
];
