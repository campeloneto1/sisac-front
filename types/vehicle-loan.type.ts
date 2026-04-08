import type { PaginatedMeta } from "@/types/brand.type";

export type VehicleLoanStatus = "in_use" | "returned";
export type VehicleLoanBorrowerType =
  | "App\\Models\\PoliceOfficer"
  | "App\\Models\\User";

export interface VehicleLoanBorrower {
  id: number;
  name?: string | null;
  email?: string | null;
  war_name?: string | null;
  registration_number?: string | null;
  badge_number?: string | null;
  type?: string | null;
  type_label?: string | null;
}

export interface VehicleLoanItem {
  id: number;
  vehicle_id: number;
  borrower_id?: number | null;
  borrower_type?: VehicleLoanBorrowerType | null;
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
  status?: VehicleLoanStatus | null;
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
  borrower?: VehicleLoanBorrower | null;
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

export interface VehicleLoanFilters {
  page?: number;
  per_page?: number;
  vehicle_id?: number | null;
  status?: VehicleLoanStatus;
  borrower_type?: VehicleLoanBorrowerType | null;
  borrower_id?: number | null;
  external_borrower_name?: string;
  start_date_from?: string;
  start_date_to?: string;
  city_id?: number | null;
  subunit_id?: number | null;
}

export interface CreateVehicleLoanDTO {
  vehicle_id: number;
  borrower_id?: number | null;
  borrower_type?: VehicleLoanBorrowerType | null;
  external_borrower_name?: string | null;
  external_borrower_document?: string | null;
  external_borrower_phone?: string | null;
  city_id?: number | null;
  subunit_id?: number | null;
  start_date?: string | null;
  start_time?: string | null;
  end_date?: string | null;
  end_time?: string | null;
  start_km: number;
  end_km?: number | null;
  start_notes?: string | null;
  return_notes?: string | null;
  status?: VehicleLoanStatus | null;
}

export interface UpdateVehicleLoanDTO extends Partial<CreateVehicleLoanDTO> {}

export interface MarkVehicleLoanReturnedDTO {
  end_date: string;
  end_time?: string | null;
  end_km: number;
  return_notes?: string | null;
}

export interface VehicleLoanResponse {
  message: string;
  data: VehicleLoanItem;
}

export interface PaginatedVehicleLoansResponse {
  data: VehicleLoanItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}

export const vehicleLoanStatusOptions: Array<{
  value: VehicleLoanStatus;
  label: string;
}> = [
  { value: "in_use", label: "Em uso" },
  { value: "returned", label: "Devolvido" },
];

export const vehicleLoanBorrowerTypeOptions: Array<{
  value: VehicleLoanBorrowerType;
  label: string;
}> = [
  { value: "App\\Models\\PoliceOfficer", label: "Policial" },
  { value: "App\\Models\\User", label: "Usuário" },
];

export function getVehicleLoanBorrowerLabel(loan: VehicleLoanItem) {
  if (loan.borrower) {
    const policeOfficerLabel =
      loan.borrower.war_name ||
      loan.borrower.name ||
      loan.borrower.registration_number;

    if (loan.borrower_type === "App\\Models\\PoliceOfficer") {
      return policeOfficerLabel ?? "Policial vinculado";
    }

    return loan.borrower.name ?? loan.borrower.email ?? "Usuário vinculado";
  }

  return loan.external_borrower_name ?? "Tomador externo";
}

export function getVehicleLoanStatusVariant(status?: VehicleLoanStatus | null) {
  switch (status) {
    case "in_use":
      return "info";
    case "returned":
      return "success";
    default:
      return "outline";
  }
}
