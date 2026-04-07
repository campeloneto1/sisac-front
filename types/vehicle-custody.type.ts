import type { PaginatedMeta } from "@/types/brand.type";

export type VehicleCustodyStatus = "in_use" | "returned";
export type VehicleCustodyHolderType =
  | "App\\Models\\PoliceOfficer"
  | "App\\Models\\User";

export interface VehicleCustodyHolder {
  id: number;
  name?: string | null;
  email?: string | null;
  war_name?: string | null;
  registration_number?: string | null;
  badge_number?: string | null;
  type?: string | null;
  type_label?: string | null;
}

export interface VehicleCustodyItem {
  id: number;
  vehicle_id: number;
  borrower_id?: number | null;
  borrower_type?: VehicleCustodyHolderType | null;
  external_borrower_name?: string | null;
  external_borrower_document?: string | null;
  external_borrower_phone?: string | null;
  city_id?: number | null;
  subunit_id?: number | null;
  start_date: string;
  start_time?: string | null;
  end_date?: string | null;
  end_time?: string | null;
  start_km: number;
  end_km?: number | null;
  km_traveled?: number | null;
  start_notes?: string | null;
  return_notes?: string | null;
  status?: VehicleCustodyStatus | null;
  status_label?: string | null;
  status_color?: string | null;
  is_returned: boolean;
  is_overdue?: boolean;
  vehicle?: {
    id: number;
    license_plate: string;
    special_plate?: string | null;
    operational_status_label?: string | null;
    vehicle_type?: {
      id: number;
      name: string;
      code?: string | null;
    } | null;
    variant?: {
      id: number;
      name: string;
      brand?: {
        id: number;
        name: string;
      } | null;
    } | null;
    color?: {
      id: number;
      name: string;
    } | null;
  } | null;
  borrower?: VehicleCustodyHolder | null;
  city?: {
    id: number;
    name: string;
    abbreviation?: string | null;
  } | null;
  subunit?: {
    id: number;
    name: string;
    abbreviation?: string | null;
  } | null;
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

export interface VehicleCustodyFilters {
  page?: number;
  per_page?: number;
  vehicle_id?: number | null;
  status?: VehicleCustodyStatus;
  borrower_type?: VehicleCustodyHolderType | null;
  borrower_id?: number | null;
  external_borrower_name?: string;
  start_date_from?: string;
  start_date_to?: string;
  city_id?: number | null;
  subunit_id?: number | null;
}

export interface CreateVehicleCustodyDTO {
  vehicle_id: number;
  borrower_id?: number | null;
  borrower_type?: VehicleCustodyHolderType | null;
  external_borrower_name?: string | null;
  external_borrower_document?: string | null;
  external_borrower_phone?: string | null;
  city_id?: number | null;
  subunit_id?: number | null;
  start_km: number;
  start_notes?: string | null;
}

export interface UpdateVehicleCustodyDTO extends Partial<CreateVehicleCustodyDTO> {}

export interface FinalizeVehicleCustodyDTO {
  end_km: number;
  return_notes?: string | null;
}

export interface VehicleCustodyResponse {
  message: string;
  data: VehicleCustodyItem;
}

export interface PaginatedVehicleCustodiesResponse {
  data: VehicleCustodyItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}

export const vehicleCustodyStatusOptions: Array<{
  value: VehicleCustodyStatus;
  label: string;
}> = [
  { value: "in_use", label: "Em cautela" },
  { value: "returned", label: "Finalizado" },
];

export const vehicleCustodyHolderTypeOptions: Array<{
  value: VehicleCustodyHolderType;
  label: string;
}> = [
  { value: "App\\Models\\PoliceOfficer", label: "Policial" },
  { value: "App\\Models\\User", label: "Usuario" },
];

export function getVehicleCustodyHolderLabel(custody: VehicleCustodyItem) {
  if (custody.borrower) {
    const policeOfficerLabel =
      custody.borrower.war_name ||
      custody.borrower.name ||
      custody.borrower.registration_number;

    if (custody.borrower_type === "App\\Models\\PoliceOfficer") {
      return policeOfficerLabel ?? "Policial vinculado";
    }

    return (
      custody.borrower.name ??
      custody.borrower.email ??
      "Usuario vinculado"
    );
  }

  return custody.external_borrower_name ?? "Responsavel externo";
}

export function getVehicleCustodyStatusVariant(
  status?: VehicleCustodyStatus | null,
) {
  switch (status) {
    case "in_use":
      return "secondary";
    case "returned":
      return "success";
    default:
      return "outline";
  }
}
