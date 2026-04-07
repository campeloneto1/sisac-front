import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateVehicleTypeDTO,
  PaginatedVehicleTypesResponse,
  UpdateVehicleTypeDTO,
  VehicleTypeFilters,
  VehicleTypeResponse,
} from "@/types/vehicle-type.type";

export const vehicleTypesService = {
  async index(
    filters: VehicleTypeFilters = {},
  ): Promise<PaginatedVehicleTypesResponse> {
    const { data } = await api.get<PaginatedVehicleTypesResponse>(
      "/vehicle-types",
      {
        params: filters,
        skipSubunit: true,
      },
    );

    return data;
  },

  async show(id: number | string): Promise<VehicleTypeResponse> {
    const { data } = await api.get<VehicleTypeResponse>(
      `/vehicle-types/${id}`,
      {
        skipSubunit: true,
      },
    );

    return data;
  },

  async create(payload: CreateVehicleTypeDTO): Promise<VehicleTypeResponse> {
    const { data } = await api.post<VehicleTypeResponse>(
      "/vehicle-types",
      payload,
      {
        skipSubunit: true,
      },
    );

    return data;
  },

  async update(
    id: number | string,
    payload: UpdateVehicleTypeDTO,
  ): Promise<VehicleTypeResponse> {
    const { data } = await api.put<VehicleTypeResponse>(
      `/vehicle-types/${id}`,
      payload,
      {
        skipSubunit: true,
      },
    );

    return data;
  },

  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(
      `/vehicle-types/${id}`,
      {
        skipSubunit: true,
      },
    );

    return data;
  },
};
