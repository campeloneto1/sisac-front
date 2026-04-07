import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateVehicleDamageDTO,
  PaginatedVehicleDamagesResponse,
  UpdateVehicleDamageDTO,
  VehicleDamageFilters,
  VehicleDamageResponse,
} from "@/types/vehicle-damage.type";

export const vehicleDamagesService = {
  async index(
    filters: VehicleDamageFilters = {},
  ): Promise<PaginatedVehicleDamagesResponse> {
    const { data } = await api.get<PaginatedVehicleDamagesResponse>(
      "/vehicle-damages",
      {
        params: filters,
      },
    );

    return data;
  },

  async show(id: number | string): Promise<VehicleDamageResponse> {
    const { data } = await api.get<VehicleDamageResponse>(
      `/vehicle-damages/${id}`,
    );
    return data;
  },

  async create(payload: CreateVehicleDamageDTO): Promise<VehicleDamageResponse> {
    const { data } = await api.post<VehicleDamageResponse>(
      "/vehicle-damages",
      payload,
    );
    return data;
  },

  async update(
    id: number | string,
    payload: UpdateVehicleDamageDTO,
  ): Promise<VehicleDamageResponse> {
    const { data } = await api.put<VehicleDamageResponse>(
      `/vehicle-damages/${id}`,
      payload,
    );
    return data;
  },

  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(
      `/vehicle-damages/${id}`,
    );
    return data;
  },
};
