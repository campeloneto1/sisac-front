import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateVehicleRentalDTO,
  PaginatedVehicleRentalsResponse,
  UpdateVehicleRentalDTO,
  VehicleRentalFilters,
  VehicleRentalResponse,
} from "@/types/vehicle-rental.type";

export const vehicleRentalsService = {
  async index(
    filters: VehicleRentalFilters = {},
  ): Promise<PaginatedVehicleRentalsResponse> {
    const { data } = await api.get<PaginatedVehicleRentalsResponse>(
      "/vehicle-rentals",
      {
        params: filters,
      },
    );

    return data;
  },

  async show(id: number | string): Promise<VehicleRentalResponse> {
    const { data } = await api.get<VehicleRentalResponse>(
      `/vehicle-rentals/${id}`,
    );
    return data;
  },

  async create(payload: CreateVehicleRentalDTO): Promise<VehicleRentalResponse> {
    const { data } = await api.post<VehicleRentalResponse>(
      "/vehicle-rentals",
      payload,
    );
    return data;
  },

  async update(
    id: number | string,
    payload: UpdateVehicleRentalDTO,
  ): Promise<VehicleRentalResponse> {
    const { data } = await api.put<VehicleRentalResponse>(
      `/vehicle-rentals/${id}`,
      payload,
    );
    return data;
  },

  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(
      `/vehicle-rentals/${id}`,
    );
    return data;
  },
};
