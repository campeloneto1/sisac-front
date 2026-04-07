import { api } from "@/lib/api";
import type {
  MarkAllNotificationsReadResponse,
  NotificationFilters,
  NotificationResponse,
  NotificationsUnreadCountResponse,
  PaginatedNotificationsResponse,
} from "@/types/notification.type";

export const notificationsService = {
  async index(
    filters: NotificationFilters = {},
  ): Promise<PaginatedNotificationsResponse> {
    const { data } = await api.get<PaginatedNotificationsResponse>(
      "/notifications",
      {
        params: filters,
        skipSubunit: true,
      },
    );

    return data;
  },

  async show(id: string): Promise<NotificationResponse> {
    const { data } = await api.get<NotificationResponse>(`/notifications/${id}`, {
      skipSubunit: true,
    });
    return data;
  },

  async unreadCount(): Promise<NotificationsUnreadCountResponse> {
    const { data } = await api.get<NotificationsUnreadCountResponse>(
      "/notifications/unread-count",
      {
        skipSubunit: true,
      },
    );
    return data;
  },

  async markAsRead(id: string): Promise<NotificationResponse> {
    const { data } = await api.post<NotificationResponse>(
      `/notifications/${id}/mark-as-read`,
      {},
      {
        skipSubunit: true,
      },
    );
    return data;
  },

  async markAllAsRead(): Promise<MarkAllNotificationsReadResponse> {
    const { data } = await api.post<MarkAllNotificationsReadResponse>(
      "/notifications/mark-all-as-read",
      {},
      {
        skipSubunit: true,
      },
    );
    return data;
  },
};
