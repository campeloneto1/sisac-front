import type { PaginatedMeta } from "@/types/brand.type";

export interface VehicleTypeItem {
  id: number;
  name: string;
  slug: string;
  code?: string | null;
  is_active: boolean;
  vehicles_count?: number | null;
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

export interface VehicleTypeFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CreateVehicleTypeDTO {
  name: string;
  slug: string;
  code?: string | null;
  is_active?: boolean;
}

export interface UpdateVehicleTypeDTO extends Partial<CreateVehicleTypeDTO> {}

export interface VehicleTypeResponse {
  message: string;
  data: VehicleTypeItem;
}

export interface PaginatedVehicleTypesResponse {
  data: VehicleTypeItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}
