import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateVehicleCustodyDTO,
  FinalizeVehicleCustodyDTO,
  PaginatedVehicleCustodiesResponse,
  UpdateVehicleCustodyDTO,
  VehicleCustodyFilters,
  VehicleCustodyResponse,
} from "@/types/vehicle-custody.type";

export const vehicleCustodiesService = {
  async index(
    filters: VehicleCustodyFilters = {},
  ): Promise<PaginatedVehicleCustodiesResponse> {
    const { data } = await api.get<PaginatedVehicleCustodiesResponse>(
      "/vehicle-custodies",
      {
        params: filters,
      },
    );

    return data;
  },

  async show(id: number | string): Promise<VehicleCustodyResponse> {
    const { data } = await api.get<VehicleCustodyResponse>(
      `/vehicle-custodies/${id}`,
    );
    return data;
  },

  async create(
    payload: CreateVehicleCustodyDTO,
  ): Promise<VehicleCustodyResponse> {
    const { data } = await api.post<VehicleCustodyResponse>(
      "/vehicle-custodies",
      payload,
    );
    return data;
  },

  async update(
    id: number | string,
    payload: UpdateVehicleCustodyDTO,
  ): Promise<VehicleCustodyResponse> {
    const { data } = await api.put<VehicleCustodyResponse>(
      `/vehicle-custodies/${id}`,
      payload,
    );
    return data;
  },

  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(
      `/vehicle-custodies/${id}`,
    );
    return data;
  },

  async finalize(
    id: number | string,
    payload: FinalizeVehicleCustodyDTO,
  ): Promise<VehicleCustodyResponse> {
    const { data } = await api.post<VehicleCustodyResponse>(
      `/vehicle-custodies/${id}/mark-as-returned`,
      payload,
    );
    return data;
  },
};
