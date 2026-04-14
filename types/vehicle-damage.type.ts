import type { PaginatedMeta } from "@/types/brand.type";
import type { UserListItem } from "@/types/user.type";
import type { VehicleCustodyItem } from "@/types/vehicle-custody.type";
import type { VehicleLoanItem } from "@/types/vehicle-loan.type";
import type { VehicleMaintenanceItem } from "@/types/vehicle-maintenance.type";
import type { VehicleItem } from "@/types/vehicle.type";

export type VehicleDamageDetectionMoment =
  | "pickup"
  | "return"
  | "maintenance"
  | "inspection";

export type VehicleDamageType =
  | "scratch"
  | "dent"
  | "broken_part"
  | "paint_damage"
  | "mechanical"
  | "electrical"
  | "other";

export type VehicleDamageSeverity =
  | "minor"
  | "moderate"
  | "severe"
  | "critical";

export type VehicleDamageStatus =
  | "pending"
  | "under_repair"
  | "repaired"
  | "not_repaired";

export type VehicleDamageContextType =
  | "vehicle_loan"
  | "vehicle_custody"
  | "vehicle_maintenance";

export interface VehicleDamageUploadItem {
  id: number;
  file_name?: string | null;
  original_name?: string | null;
  mime_type?: string | null;
  extension?: string | null;
  size?: number | null;
  url?: string | null;
}

export interface VehicleDamageItem {
  id: number;
  vehicle_id: number;
  vehicle?: VehicleItem | null;
  damageable_type?: string | null;
  damageable_id?: number | null;
  damageable?:
    | VehicleLoanItem
    | VehicleCustodyItem
    | VehicleMaintenanceItem
    | null;
  vehicle_loan_id?: number | null;
  vehicle_custody_id?: number | null;
  vehicle_maintenance_id?: number | null;
  detected_date?: string | null;
  detected_time?: string | null;
  detection_moment: VehicleDamageDetectionMoment;
  detection_moment_label?: string | null;
  detection_moment_description?: string | null;
  damage_type: VehicleDamageType;
  damage_type_label?: string | null;
  damage_type_icon?: string | null;
  location: string;
  description: string;
  severity?: VehicleDamageSeverity | null;
  severity_label?: string | null;
  severity_color?: string | null;
  severity_priority?: number | null;
  photos?: string[] | null;
  uploads?: VehicleDamageUploadItem[];
  responsible_user_id?: number | null;
  responsible_user?: UserListItem | null;
  responsible_external_name?: string | null;
  estimated_repair_cost?: number | null;
  actual_repair_cost?: number | null;
  status?: VehicleDamageStatus | null;
  status_label?: string | null;
  status_color?: string | null;
  repair_date?: string | null;
  notes?: string | null;
  creator?: {
    id: number;
    name: string;
    email?: string;
  } | null;
  updater?: {
    id: number;
    name: string;
    email?: string;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface VehicleDamageFilters {
  page?: number;
  per_page?: number;
  search?: string;
  vehicle_id?: number | null;
  damage_type?: VehicleDamageType;
  severity?: VehicleDamageSeverity;
  status?: VehicleDamageStatus;
  detection_moment?: VehicleDamageDetectionMoment;
}

export interface CreateVehicleDamageDTO {
  vehicle_id: number;
  vehicle_loan_id?: number | null;
  vehicle_custody_id?: number | null;
  vehicle_maintenance_id?: number | null;
  detected_date?: string | null;
  detected_time?: string | null;
  detection_moment: VehicleDamageDetectionMoment;
  damage_type: VehicleDamageType;
  location: string;
  description: string;
  severity?: VehicleDamageSeverity | null;
  photos?: string[] | null;
  responsible_user_id?: number | null;
  responsible_external_name?: string | null;
  estimated_repair_cost?: number | null;
  actual_repair_cost?: number | null;
  status?: VehicleDamageStatus | null;
  repair_date?: string | null;
  notes?: string | null;
}

export interface UpdateVehicleDamageDTO
  extends Partial<CreateVehicleDamageDTO> {}

export interface CreateVehicleDamageWithFilesDTO extends CreateVehicleDamageDTO {
  photo_files?: File[];
}

export interface UpdateVehicleDamageWithFilesDTO extends UpdateVehicleDamageDTO {
  photo_files?: File[];
  delete_upload_ids?: number[];
}

export interface VehicleDamageResponse {
  message: string;
  data: VehicleDamageItem;
}

export interface PaginatedVehicleDamagesResponse {
  data: VehicleDamageItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}

export const vehicleDamageDetectionMomentOptions: Array<{
  value: VehicleDamageDetectionMoment;
  label: string;
}> = [
  { value: "pickup", label: "Na retirada" },
  { value: "return", label: "Na devolução" },
  { value: "maintenance", label: "Durante manutenção" },
  { value: "inspection", label: "Durante inspeção" },
];

export const vehicleDamageTypeOptions: Array<{
  value: VehicleDamageType;
  label: string;
}> = [
  { value: "scratch", label: "Arranhao" },
  { value: "dent", label: "Amassado" },
  { value: "broken_part", label: "Peca quebrada" },
  { value: "paint_damage", label: "Dano na pintura" },
  { value: "mechanical", label: "Mecânico" },
  { value: "electrical", label: "Elétrico" },
  { value: "other", label: "Outro" },
];

export const vehicleDamageSeverityOptions: Array<{
  value: VehicleDamageSeverity;
  label: string;
}> = [
  { value: "minor", label: "Leve" },
  { value: "moderate", label: "Moderado" },
  { value: "severe", label: "Grave" },
  { value: "critical", label: "Crítico" },
];

export const vehicleDamageStatusOptions: Array<{
  value: VehicleDamageStatus;
  label: string;
}> = [
  { value: "pending", label: "Pendente" },
  { value: "under_repair", label: "Em reparo" },
  { value: "repaired", label: "Reparado" },
  { value: "not_repaired", label: "Não reparado" },
];

export const vehicleDamageContextOptions: Array<{
  value: VehicleDamageContextType;
  label: string;
}> = [
  { value: "vehicle_loan", label: "Empréstimo" },
  { value: "vehicle_custody", label: "Cautela" },
  { value: "vehicle_maintenance", label: "Manutenção" },
];

export function getVehicleDamageContextType(
  damage?: Pick<
    VehicleDamageItem,
    "vehicle_loan_id" | "vehicle_custody_id" | "vehicle_maintenance_id"
  > | null,
): VehicleDamageContextType | null {
  if (damage?.vehicle_loan_id) {
    return "vehicle_loan";
  }

  if (damage?.vehicle_custody_id) {
    return "vehicle_custody";
  }

  if (damage?.vehicle_maintenance_id) {
    return "vehicle_maintenance";
  }

  return null;
}

export function getVehicleDamageContextLabel(
  damage?: Pick<
    VehicleDamageItem,
    "vehicle_loan_id" | "vehicle_custody_id" | "vehicle_maintenance_id"
  > | null,
) {
  const contextType = getVehicleDamageContextType(damage);

  return (
    vehicleDamageContextOptions.find((option) => option.value === contextType)
      ?.label ?? "Sem contexto"
  );
}

export function getVehicleDamageSeverityVariant(
  severity?: VehicleDamageSeverity | null,
) {
  switch (severity) {
    case "minor":
      return "success";
    case "moderate":
      return "warning";
    case "severe":
      return "danger";
    case "critical":
      return "danger";
    default:
      return "outline";
  }
}

export function getVehicleDamageStatusVariant(status?: VehicleDamageStatus | null) {
  switch (status) {
    case "pending":
      return "warning";
    case "under_repair":
      return "info";
    case "repaired":
      return "success";
    case "not_repaired":
      return "danger";
    default:
      return "outline";
  }
}
