import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateVehicleLoanDTO,
  MarkVehicleLoanReturnedDTO,
  PaginatedVehicleLoansResponse,
  UpdateVehicleLoanDTO,
  VehicleLoanFilters,
  VehicleLoanResponse,
} from "@/types/vehicle-loan.type";

export const vehicleLoansService = {
  async index(
    filters: VehicleLoanFilters = {},
  ): Promise<PaginatedVehicleLoansResponse> {
    const { data } = await api.get<PaginatedVehicleLoansResponse>(
      "/vehicle-loans",
      {
        params: filters,
      },
    );

    return data;
  },

  async show(id: number | string): Promise<VehicleLoanResponse> {
    const { data } = await api.get<VehicleLoanResponse>(`/vehicle-loans/${id}`);
    return data;
  },

  async create(payload: CreateVehicleLoanDTO): Promise<VehicleLoanResponse> {
    const { data } = await api.post<VehicleLoanResponse>(
      "/vehicle-loans",
      payload,
    );
    return data;
  },

  async update(
    id: number | string,
    payload: UpdateVehicleLoanDTO,
  ): Promise<VehicleLoanResponse> {
    const { data } = await api.put<VehicleLoanResponse>(
      `/vehicle-loans/${id}`,
      payload,
    );
    return data;
  },

  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(
      `/vehicle-loans/${id}`,
    );
    return data;
  },

  async markAsReturned(
    id: number | string,
    payload: MarkVehicleLoanReturnedDTO,
  ): Promise<VehicleLoanResponse> {
    const { data } = await api.post<VehicleLoanResponse>(
      `/vehicle-loans/${id}/mark-as-returned`,
      payload,
    );
    return data;
  },
};
