import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateVehicleDTO,
  PaginatedVehiclesResponse,
  UpdateVehicleDTO,
  VehicleFilters,
  VehicleResponse,
} from "@/types/vehicle.type";

export const vehiclesService = {
  async index(filters: VehicleFilters = {}): Promise<PaginatedVehiclesResponse> {
    const { data } = await api.get<PaginatedVehiclesResponse>("/vehicles", {
      params: filters,
    });

    return data;
  },

  async show(id: number | string): Promise<VehicleResponse> {
    const { data } = await api.get<VehicleResponse>(`/vehicles/${id}`);
    return data;
  },

  async create(payload: CreateVehicleDTO): Promise<VehicleResponse> {
    const { data } = await api.post<VehicleResponse>("/vehicles", payload);
    return data;
  },

  async update(
    id: number | string,
    payload: UpdateVehicleDTO,
  ): Promise<VehicleResponse> {
    const { data } = await api.put<VehicleResponse>(`/vehicles/${id}`, payload);
    return data;
  },

  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/vehicles/${id}`);
    return data;
  },
};
