import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateVehicleMaintenanceDTO,
  PaginatedVehicleMaintenancesResponse,
  UpdateVehicleMaintenanceDTO,
  VehicleMaintenanceFilters,
  VehicleMaintenanceResponse,
} from "@/types/vehicle-maintenance.type";

export const vehicleMaintenancesService = {
  async index(
    filters: VehicleMaintenanceFilters = {},
  ): Promise<PaginatedVehicleMaintenancesResponse> {
    const { data } = await api.get<PaginatedVehicleMaintenancesResponse>(
      "/vehicle-maintenances",
      {
        params: filters,
      },
    );

    return data;
  },

  async show(id: number | string): Promise<VehicleMaintenanceResponse> {
    const { data } = await api.get<VehicleMaintenanceResponse>(
      `/vehicle-maintenances/${id}`,
    );
    return data;
  },

  async create(
    payload: CreateVehicleMaintenanceDTO,
  ): Promise<VehicleMaintenanceResponse> {
    const { data } = await api.post<VehicleMaintenanceResponse>(
      "/vehicle-maintenances",
      payload,
    );
    return data;
  },

  async update(
    id: number | string,
    payload: UpdateVehicleMaintenanceDTO,
  ): Promise<VehicleMaintenanceResponse> {
    const { data } = await api.put<VehicleMaintenanceResponse>(
      `/vehicle-maintenances/${id}`,
      payload,
    );
    return data;
  },

  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(
      `/vehicle-maintenances/${id}`,
    );
    return data;
  },
};
