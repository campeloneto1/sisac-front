import type { PaginatedMeta } from "@/types/brand.type";
import type { PoliceOfficerItem } from "@/types/police-officer.type";
import type { UserListItem } from "@/types/user.type";
import type { VehicleItem } from "@/types/vehicle.type";

export type VehicleCustodyStatus = "active" | "ended" | "cancelled";
export type VehicleCustodyCustodianType =
  | "App\\Models\\PoliceOfficer"
  | "App\\Models\\User";

export type VehicleCustodyCustodian = PoliceOfficerItem | UserListItem;

export interface VehicleCustodyItem {
  id: number;
  vehicle_id: number;
  vehicle?: VehicleItem | null;
  custodian_type: VehicleCustodyCustodianType;
  custodian_id: number;
  custodian?: VehicleCustodyCustodian | null;
  document_number?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  actual_end_date?: string | null;
  reason?: string | null;
  status?: VehicleCustodyStatus | null;
  status_label?: string | null;
  status_color?: string | null;
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

export interface VehicleCustodyFilters {
  page?: number;
  per_page?: number;
  search?: string;
  vehicle_id?: number | null;
  status?: VehicleCustodyStatus;
  custodian_type?: VehicleCustodyCustodianType | null;
  custodian_id?: number | null;
  start_date?: string;
  end_date?: string;
}

export interface CreateVehicleCustodyDTO {
  vehicle_id: number;
  custodian_type: VehicleCustodyCustodianType;
  custodian_id: number;
  document_number?: string | null;
  end_date?: string | null;
  reason?: string | null;
  notes?: string | null;
}

export interface UpdateVehicleCustodyDTO extends Partial<CreateVehicleCustodyDTO> {
  start_date?: string | null;
}

export interface FinalizeVehicleCustodyDTO {
  notes?: string | null;
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
  { value: "active", label: "Ativa" },
  { value: "ended", label: "Encerrada" },
  { value: "cancelled", label: "Cancelada" },
];

export const vehicleCustodyCustodianTypeOptions: Array<{
  value: VehicleCustodyCustodianType;
  label: string;
}> = [
  { value: "App\\Models\\PoliceOfficer", label: "Policial" },
  { value: "App\\Models\\User", label: "Usuario" },
];

function isPoliceOfficerCustodian(
  custodian: VehicleCustodyCustodian | null | undefined,
): custodian is PoliceOfficerItem {
  return Boolean(
    custodian &&
      ("war_name" in custodian || "registration_number" in custodian),
  );
}

function isUserCustodian(
  custodian: VehicleCustodyCustodian | null | undefined,
): custodian is UserListItem {
  return Boolean(custodian && "email" in custodian);
}

export function getVehicleCustodyCustodianLabel(custody: VehicleCustodyItem) {
  if (isPoliceOfficerCustodian(custody.custodian)) {
    return (
      custody.custodian.war_name ||
      custody.custodian.name ||
      custody.custodian.registration_number ||
      "Policial vinculado"
    );
  }

  if (isUserCustodian(custody.custodian)) {
    return custody.custodian.name || custody.custodian.email || "Usuario vinculado";
  }

  return `Custodiante #${custody.custodian_id}`;
}

export function getVehicleCustodyStatusVariant(
  status?: VehicleCustodyStatus | null,
) {
  switch (status) {
    case "active":
      return "secondary";
    case "ended":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "outline";
  }
}
