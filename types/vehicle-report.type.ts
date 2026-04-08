import type { PaginatedMeta } from "@/types/brand.type";
import type { VehicleCustodyItem } from "@/types/vehicle-custody.type";
import type {
  VehicleDamageItem,
  VehicleDamageSeverity,
  VehicleDamageStatus,
} from "@/types/vehicle-damage.type";
import type { VehicleFuelingItem } from "@/types/vehicle-fueling.type";
import type { VehicleLoanItem } from "@/types/vehicle-loan.type";
import type { VehicleMaintenanceItem } from "@/types/vehicle-maintenance.type";
import type { VehicleItem, VehicleOperationalStatus, VehicleOwnershipType } from "@/types/vehicle.type";
import type { VehicleRentalItem } from "@/types/vehicle-rental.type";

export interface VehicleReportFilters {
  page?: number;
  per_page?: number;
  search?: string;
  vehicle_id?: number;
  color_id?: number;
  vehicle_type_id?: number;
  variant_id?: number;
  assigned_to_user_id?: number;
  city_id?: number;
  workshop_id?: number;
  company_id?: number;
  operational_status?: VehicleOperationalStatus;
  ownership_type?: VehicleOwnershipType;
  loan_status?: "in_use" | "returned";
  custody_status?: "active" | "ended" | "cancelled";
  maintenance_status?: "in_progress" | "completed" | "cancelled";
  maintenance_type?: "preventive" | "corrective" | "inspection" | "other";
  fuel_type?: "gasoline" | "ethanol" | "diesel" | "gnv";
  damage_status?: VehicleDamageStatus;
  damage_severity?: VehicleDamageSeverity;
  damage_type?: "scratch" | "dent" | "broken_part" | "paint_damage" | "mechanical" | "electrical" | "other";
  detection_moment?: "pickup" | "return" | "maintenance" | "inspection";
  rental_status?: "active" | "returned" | "renewed" | "cancelled";
  is_armored?: boolean;
  is_available_for_trip?: boolean;
  is_available?: boolean;
  only_overdue?: boolean;
  only_active?: boolean;
  date_from?: string;
  date_to?: string;
  start_date?: string;
  end_date?: string;
  contract_end_from?: string;
  contract_end_to?: string;
}

export interface VehicleReportVehicleSummary extends Omit<VehicleItem, "operational_status" | "ownership_type"> {
  operational_status?: {
    value: VehicleOperationalStatus;
    label: string;
    color?: string | null;
  } | null;
  ownership_type?: {
    value: VehicleOwnershipType;
    label: string;
    description?: string | null;
  } | null;
}

export interface VehicleFleetStatusItem {
  status: {
    value: string;
    label: string;
    color?: string | null;
  };
  total_vehicles: number;
  owned_vehicles: number;
  rented_vehicles: number;
  armored_vehicles: number;
  available_for_trip_vehicles: number;
}

export interface VehicleFleetCompositionItem {
  vehicle_type: {
    id: number | null;
    name: string;
    code?: string | null;
  };
  variant: {
    id: number | null;
    name: string;
    abbreviation?: string | null;
  };
  total_vehicles: number;
  owned_vehicles: number;
  rented_vehicles: number;
  active_vehicles: number;
}

export interface VehicleMaintenanceCostItem {
  vehicle: {
    id: number | null;
    license_plate: string | null;
    vehicle_type: string | null;
    variant: string | null;
  };
  total_maintenances: number;
  total_cost: number;
  parts_cost: number;
  labor_cost: number;
  preventive_count: number;
  corrective_count: number;
}

export interface VehicleFuelCostItem {
  vehicle: {
    id: number | null;
    license_plate: string | null;
    vehicle_type: string | null;
    variant: string | null;
  };
  total_fuelings: number;
  total_liters: number;
  total_cost: number;
  average_price_per_liter: number;
  max_km: number | null;
  min_km: number | null;
}

export interface VehicleUnavailableItem {
  vehicle: VehicleReportVehicleSummary;
  unavailability_reason: string;
  active_loan?: {
    id: number;
    start_date?: string | null;
    end_date?: string | null;
    status?: string | null;
  } | null;
  active_custody?: {
    id: number;
    start_date?: string | null;
    end_date?: string | null;
    status?: string | null;
  } | null;
  active_maintenance?: {
    id: number;
    entry_date?: string | null;
    expected_completion_date?: string | null;
    status?: string | null;
    workshop?: string | null;
  } | null;
  active_rental?: {
    id: number;
    company?: string | null;
    contract_end_date?: string | null;
    status?: string | null;
  } | null;
}

export interface VehicleDamageSummaryItem {
  severity?: {
    value: string;
    label: string;
    color?: string | null;
    priority?: number | null;
  } | null;
  status?: {
    value: string;
    label: string;
    color?: string | null;
  } | null;
  total_damages: number;
  estimated_repair_cost: number;
  actual_repair_cost: number;
}

export interface VehiclePanelData {
  vehicle: VehicleReportVehicleSummary;
  summary: {
    total_loans: number;
    total_custodies: number;
    total_maintenances: number;
    total_fuelings: number;
    total_damages: number;
    total_rentals: number;
    total_maintenance_cost: number;
    total_fueling_cost: number;
    total_estimated_damage_cost: number;
    total_actual_damage_cost: number;
  };
  active_loan?: VehicleLoanItem | null;
  active_custody?: VehicleCustodyItem | null;
  active_maintenance?: VehicleMaintenanceItem | null;
  active_rental?: VehicleRentalItem | null;
  loans: VehicleLoanItem[];
  custodies: VehicleCustodyItem[];
  maintenances: VehicleMaintenanceItem[];
  fuelings: VehicleFuelingItem[];
  damages: VehicleDamageItem[];
  rentals: VehicleRentalItem[];
}

export interface PaginatedVehicleReportResponse<T> {
  message: string;
  data: T[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
  summary?: VehicleDamageSummaryItem[];
}

export interface CollectionVehicleReportResponse<T> {
  message: string;
  data: T[];
}

export interface VehiclePanelResponse {
  message: string;
  data: VehiclePanelData;
}

export type VehicleAvailableReportResponse =
  PaginatedVehicleReportResponse<VehicleReportVehicleSummary>;
export type VehicleUnavailableReportResponse =
  PaginatedVehicleReportResponse<VehicleUnavailableItem>;
export type VehicleLoansReportResponse =
  PaginatedVehicleReportResponse<VehicleLoanItem>;
export type VehicleCustodiesReportResponse =
  PaginatedVehicleReportResponse<VehicleCustodyItem>;
export type VehicleMaintenancesReportResponse =
  PaginatedVehicleReportResponse<VehicleMaintenanceItem>;
export type VehicleFuelingsReportResponse =
  PaginatedVehicleReportResponse<VehicleFuelingItem>;
export type VehicleDamagesReportResponse =
  PaginatedVehicleReportResponse<VehicleDamageItem> & {
    summary?: VehicleDamageSummaryItem[];
  };
export type VehicleRentalsReportResponse =
  PaginatedVehicleReportResponse<VehicleRentalItem>;
