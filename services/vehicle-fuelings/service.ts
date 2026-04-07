import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateVehicleFuelingDTO,
  PaginatedVehicleFuelingsResponse,
  UpdateVehicleFuelingDTO,
  VehicleFuelingFilters,
  VehicleFuelingResponse,
} from "@/types/vehicle-fueling.type";

export const vehicleFuelingsService = {
  async index(
    filters: VehicleFuelingFilters = {},
  ): Promise<PaginatedVehicleFuelingsResponse> {
    const { data } = await api.get<PaginatedVehicleFuelingsResponse>(
      "/vehicle-fuelings",
      {
        params: filters,
      },
    );

    return data;
  },

  async show(id: number | string): Promise<VehicleFuelingResponse> {
    const { data } = await api.get<VehicleFuelingResponse>(
      `/vehicle-fuelings/${id}`,
    );
    return data;
  },

  async create(payload: CreateVehicleFuelingDTO): Promise<VehicleFuelingResponse> {
    const { data } = await api.post<VehicleFuelingResponse>(
      "/vehicle-fuelings",
      payload,
    );
    return data;
  },

  async update(
    id: number | string,
    payload: UpdateVehicleFuelingDTO,
  ): Promise<VehicleFuelingResponse> {
    const { data } = await api.put<VehicleFuelingResponse>(
      `/vehicle-fuelings/${id}`,
      payload,
    );
    return data;
  },

  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(
      `/vehicle-fuelings/${id}`,
    );
    return data;
  },
};
