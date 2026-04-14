import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateVehicleDamageDTO,
  CreateVehicleDamageWithFilesDTO,
  PaginatedVehicleDamagesResponse,
  UpdateVehicleDamageDTO,
  UpdateVehicleDamageWithFilesDTO,
  VehicleDamageFilters,
  VehicleDamageResponse,
} from "@/types/vehicle-damage.type";

function buildFormData(
  payload: CreateVehicleDamageDTO | UpdateVehicleDamageDTO,
  photoFiles?: File[],
  deleteUploadIds?: number[],
): FormData {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    if (key === "photos" && Array.isArray(value)) {
      value.forEach((photo, index) => {
        formData.append(`photos[${index}]`, photo);
      });
      return;
    }

    formData.append(key, String(value));
  });

  if (photoFiles && photoFiles.length > 0) {
    photoFiles.forEach((file, index) => {
      formData.append(`photo_files[${index}]`, file);
    });
  }

  if (deleteUploadIds && deleteUploadIds.length > 0) {
    deleteUploadIds.forEach((id, index) => {
      formData.append(`delete_upload_ids[${index}]`, String(id));
    });
  }

  return formData;
}

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

  async create(
    payload: CreateVehicleDamageDTO | CreateVehicleDamageWithFilesDTO,
  ): Promise<VehicleDamageResponse> {
    const hasFiles =
      "photo_files" in payload &&
      payload.photo_files &&
      payload.photo_files.length > 0;

    if (hasFiles) {
      const { photo_files, ...rest } = payload as CreateVehicleDamageWithFilesDTO;
      const formData = buildFormData(rest, photo_files);

      const { data } = await api.post<VehicleDamageResponse>(
        "/vehicle-damages",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return data;
    }

    const { data } = await api.post<VehicleDamageResponse>(
      "/vehicle-damages",
      payload,
    );
    return data;
  },

  async update(
    id: number | string,
    payload: UpdateVehicleDamageDTO | UpdateVehicleDamageWithFilesDTO,
  ): Promise<VehicleDamageResponse> {
    const hasFiles =
      "photo_files" in payload &&
      payload.photo_files &&
      payload.photo_files.length > 0;
    const hasDeleteIds =
      "delete_upload_ids" in payload &&
      payload.delete_upload_ids &&
      payload.delete_upload_ids.length > 0;

    if (hasFiles || hasDeleteIds) {
      const { photo_files, delete_upload_ids, ...rest } =
        payload as UpdateVehicleDamageWithFilesDTO;
      const formData = buildFormData(rest, photo_files, delete_upload_ids);

      // Laravel não suporta PUT com FormData, usar POST com _method
      formData.append("_method", "PUT");

      const { data } = await api.post<VehicleDamageResponse>(
        `/vehicle-damages/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return data;
    }

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
