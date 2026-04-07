import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateNotificationResponsibilityDTO,
  NotificationResponsibilityFilters,
  NotificationResponsibilityItem,
  NotificationResponsibilityResponse,
  PaginatedResponse,
  UpdateNotificationResponsibilityDTO,
} from "@/types/notification-responsibility.type";

export const notificationResponsibilitiesService = {
  async index(filters: NotificationResponsibilityFilters = {}): Promise<PaginatedResponse<NotificationResponsibilityItem>> {
    const { data } = await api.get<PaginatedResponse<NotificationResponsibilityItem>>("/notification-responsibilities", {
      params: filters,
    });

    return data;
  },
  async show(id: number | string): Promise<NotificationResponsibilityResponse> {
    const { data } = await api.get<NotificationResponsibilityResponse>(`/notification-responsibilities/${id}`);

    return data;
  },
  async create(payload: CreateNotificationResponsibilityDTO): Promise<NotificationResponsibilityResponse> {
    const { data } = await api.post<NotificationResponsibilityResponse>("/notification-responsibilities", payload);

    return data;
  },
  async update(id: number | string, payload: UpdateNotificationResponsibilityDTO): Promise<NotificationResponsibilityResponse> {
    const { data } = await api.put<NotificationResponsibilityResponse>(`/notification-responsibilities/${id}`, payload);

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/notification-responsibilities/${id}`);

    return data;
  },
};
